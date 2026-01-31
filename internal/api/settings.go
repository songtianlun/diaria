package api

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"

	"github.com/songtianlun/diaria/internal/config"
)

// generateToken generates a random 32-character hex token
func generateToken() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// RegisterSettingsRoutes registers settings-related API endpoints
func RegisterSettingsRoutes(app *pocketbase.PocketBase, e *core.ServeEvent) {
	configService := config.NewConfigService(app)

	// Get API token status and value
	e.Router.GET("/api/settings/api-token", func(c echo.Context) error {
		authRecord, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
		if authRecord == nil {
			return apis.NewUnauthorizedError("The request requires valid authorization token.", nil)
		}

		userId := authRecord.Id

		token, _ := configService.GetString(userId, "api.token")
		enabled, _ := configService.GetBool(userId, "api.enabled")

		if token == "" {
			return c.JSON(http.StatusOK, map[string]any{
				"exists":  false,
				"enabled": false,
				"token":   "",
			})
		}

		return c.JSON(http.StatusOK, map[string]any{
			"exists":  true,
			"enabled": enabled,
			"token":   token,
		})
	}, apis.ActivityLogger(app), apis.RequireRecordAuth())

	// Toggle API token enabled/disabled
	e.Router.POST("/api/settings/api-token/toggle", func(c echo.Context) error {
		authRecord, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
		if authRecord == nil {
			return apis.NewUnauthorizedError("The request requires valid authorization token.", nil)
		}

		userId := authRecord.Id

		token, _ := configService.GetString(userId, "api.token")
		enabled, _ := configService.GetBool(userId, "api.enabled")

		if token == "" {
			// No token exists, create one and enable it
			newToken, err := generateToken()
			if err != nil {
				return apis.NewBadRequestError("Failed to generate token", err)
			}

			if err := configService.Set(userId, "api.token", newToken); err != nil {
				return apis.NewBadRequestError("Failed to save token", err)
			}
			if err := configService.Set(userId, "api.enabled", true); err != nil {
				return apis.NewBadRequestError("Failed to save enabled status", err)
			}

			return c.JSON(http.StatusOK, map[string]any{
				"enabled": true,
				"token":   newToken,
			})
		}

		// Toggle existing token
		newEnabled := !enabled
		if err := configService.Set(userId, "api.enabled", newEnabled); err != nil {
			return apis.NewBadRequestError("Failed to update token", err)
		}

		return c.JSON(http.StatusOK, map[string]any{
			"enabled": newEnabled,
			"token":   token,
		})
	}, apis.ActivityLogger(app), apis.RequireRecordAuth())

	// Reset API token (generate new one)
	e.Router.POST("/api/settings/api-token/reset", func(c echo.Context) error {
		authRecord, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
		if authRecord == nil {
			return apis.NewUnauthorizedError("The request requires valid authorization token.", nil)
		}

		userId := authRecord.Id

		// Generate new token
		newToken, err := generateToken()
		if err != nil {
			return apis.NewBadRequestError("Failed to generate token", err)
		}

		// Save new token
		if err := configService.Set(userId, "api.token", newToken); err != nil {
			return apis.NewBadRequestError("Failed to save token", err)
		}

		// Ensure enabled is set (default to true for reset)
		enabled, _ := configService.GetBool(userId, "api.enabled")
		if !enabled {
			configService.Set(userId, "api.enabled", true)
			enabled = true
		}

		return c.JSON(http.StatusOK, map[string]any{
			"enabled": enabled,
			"token":   newToken,
		})
	}, apis.ActivityLogger(app), apis.RequireRecordAuth())

	// Get settings by prefix (new v1 API)
	e.Router.GET("/api/v1/settings", func(c echo.Context) error {
		authRecord, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
		if authRecord == nil {
			return apis.NewUnauthorizedError("The request requires valid authorization token.", nil)
		}

		userId := authRecord.Id
		prefix := c.QueryParam("prefix")

		settings, err := configService.GetBatch(userId, prefix)
		if err != nil {
			return apis.NewBadRequestError("Failed to get settings", err)
		}

		return c.JSON(http.StatusOK, map[string]any{
			"settings": settings,
		})
	}, apis.ActivityLogger(app), apis.RequireRecordAuth())

	// Batch update settings (new v1 API)
	e.Router.PUT("/api/v1/settings/batch", func(c echo.Context) error {
		authRecord, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
		if authRecord == nil {
			return apis.NewUnauthorizedError("The request requires valid authorization token.", nil)
		}

		userId := authRecord.Id

		var body struct {
			Settings map[string]any `json:"settings"`
		}
		if err := c.Bind(&body); err != nil {
			return apis.NewBadRequestError("Invalid request body", err)
		}

		// Validate keys against registry
		for key := range body.Settings {
			if !strings.Contains(key, ".") {
				return apis.NewBadRequestError("Invalid setting key: "+key, nil)
			}
		}

		if err := configService.SetBatch(userId, body.Settings); err != nil {
			return apis.NewBadRequestError("Failed to save settings", err)
		}

		return c.JSON(http.StatusOK, map[string]any{
			"success": true,
		})
	}, apis.ActivityLogger(app), apis.RequireRecordAuth())
}
