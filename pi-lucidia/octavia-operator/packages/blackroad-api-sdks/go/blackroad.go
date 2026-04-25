package blackroad

import (
"bytes"
"encoding/json"
"net/http"
)

type Client struct {
APIKey  string
BaseURL string
}

func NewClient(apiKey string) *Client {
return &Client{
c (c *Client) Deploy(config map[string]interface{}) (map[string]interface{}, error) {
body, _ := json.Marshal(config)
req, _ := http.NewRequest("POST", c.BaseURL+"/deployments", bytes.NewBuffer(body))
req.Header.Set("Authorization", "Bearer "+c.APIKey)
req.Header.Set("Content-Type", "application/json")

client := &http.Client{}
resp, err := client.Do(req)
if err != nil {
 nil, err
}
defer resp.Body.Close()

var result map[string]interface{}
json.NewDecoder(resp.Body).Decode(&result)
return result, nil
}
