// BlackRoad API Client - Go SDK
// Official Go client for BlackRoad products
package blackroad

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client is the main BlackRoad API client
type Client struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
}

// Product represents a BlackRoad product
type Product struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

// Deployment represents a deployment
type Deployment struct {
	ID          string    `json:"id"`
	ProductID   string    `json:"product_id"`
	Environment string    `json:"environment"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

// NewClient creates a new BlackRoad API client
func NewClient(apiKey string) *Client {
	return &Client{
		APIKey:  apiKey,
		BaseURL: "https://api.blackroad.io",
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// request makes an HTTP request to the API
func (c *Client) request(method, endpoint string, body interface{}) (*http.Response, error) {
	url := c.BaseURL + endpoint
	
	var reqBody io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewBuffer(jsonData)
	}
	
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "BlackRoad-Go-SDK/1.0.0")
	
	return c.HTTPClient.Do(req)
}

// ListProducts lists all products
func (c *Client) ListProducts(limit int) ([]Product, error) {
	endpoint := fmt.Sprintf("/v1/products?limit=%d", limit)
	resp, err := c.request("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var products []Product
	if err := json.NewDecoder(resp.Body).Decode(&products); err != nil {
		return nil, err
	}
	
	return products, nil
}

// GetProduct gets a product by ID
func (c *Client) GetProduct(productID string) (*Product, error) {
	endpoint := fmt.Sprintf("/v1/products/%s", productID)
	resp, err := c.request("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var product Product
	if err := json.NewDecoder(resp.Body).Decode(&product); err != nil {
		return nil, err
	}
	
	return &product, nil
}

// CreateDeployment creates a new deployment
func (c *Client) CreateDeployment(productID, environment string) (*Deployment, error) {
	body := map[string]string{
		"product_id":  productID,
		"environment": environment,
	}
	
	resp, err := c.request("POST", "/v1/deployments", body)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var deployment Deployment
	if err := json.NewDecoder(resp.Body).Decode(&deployment); err != nil {
		return nil, err
	}
	
	return &deployment, nil
}

// GetDeploymentStatus gets deployment status
func (c *Client) GetDeploymentStatus(deploymentID string) (*Deployment, error) {
	endpoint := fmt.Sprintf("/v1/deployments/%s", deploymentID)
	resp, err := c.request("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var deployment Deployment
	if err := json.NewDecoder(resp.Body).Decode(&deployment); err != nil {
		return nil, err
	}
	
	return &deployment, nil
}
