package config

// ConfigMeta defines metadata for a configuration item
type ConfigMeta struct {
	Type      string // "string", "bool", "int", "float", "json"
	Default   any
	Encrypted bool
}

// ConfigRegistry defines all available configuration items
var ConfigRegistry = map[string]ConfigMeta{
	// API settings
	"api.token":   {Type: "string", Default: "", Encrypted: false},
	"api.enabled": {Type: "bool", Default: false, Encrypted: false},

	// AI Embedding settings
	"ai.enabled":            {Type: "bool", Default: false, Encrypted: false},
	"ai.embedding.base_url": {Type: "string", Default: "", Encrypted: false},
	"ai.embedding.model":    {Type: "string", Default: "", Encrypted: false},
	"ai.embedding.api_key":  {Type: "string", Default: "", Encrypted: true},

	// AI LLM settings
	"ai.llm.base_url": {Type: "string", Default: "", Encrypted: false},
	"ai.llm.model":    {Type: "string", Default: "", Encrypted: false},
	"ai.llm.api_key":  {Type: "string", Default: "", Encrypted: true},
}

// GetConfigMeta returns the metadata for a configuration key
func GetConfigMeta(key string) (ConfigMeta, bool) {
	meta, ok := ConfigRegistry[key]
	return meta, ok
}

// IsEncrypted checks if a configuration key should be encrypted
func IsEncrypted(key string) bool {
	if meta, ok := ConfigRegistry[key]; ok {
		return meta.Encrypted
	}
	return false
}

// GetDefault returns the default value for a configuration key
func GetDefault(key string) any {
	if meta, ok := ConfigRegistry[key]; ok {
		return meta.Default
	}
	return nil
}
