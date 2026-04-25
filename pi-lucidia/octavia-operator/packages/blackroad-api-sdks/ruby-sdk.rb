# BlackRoad API Client - Ruby SDK
# Official Ruby client for BlackRoad products

require 'net/http'
require 'json'
require 'uri'

module BlackRoad
  class Client
    attr_reader :api_key, :base_url

    def initialize(api_key:, base_url: 'https://api.blackroad.io')
      @api_key = api_key
      @base_url = base_url
    end

    def products
      @products ||= ProductsAPI.new(self)
    end

    def deployments
      @deployments ||= DeploymentsAPI.new(self)
    end

    def request(method, endpoint, body: nil, params: nil)
      uri = URI("#{@base_url}#{endpoint}")
      uri.query = URI.encode_www_form(params) if params

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == 'https'

      request = case method.upcase
                when 'GET'
                  Net::HTTP::Get.new(uri)
                when 'POST'
                  Net::HTTP::Post.new(uri)
                when 'PUT'
                  Net::HTTP::Put.new(uri)
                when 'DELETE'
                  Net::HTTP::Delete.new(uri)
                else
                  raise ArgumentError, "Unsupported method: #{method}"
                end

      request['Authorization'] = "Bearer #{@api_key}"
      request['Content-Type'] = 'application/json'
      request['User-Agent'] = 'BlackRoad-Ruby-SDK/1.0.0'
      request.body = body.to_json if body

      response = http.request(request)
      
      raise "API Error: #{response.code} #{response.message}" unless response.is_a?(Net::HTTPSuccess)
      
      JSON.parse(response.body)
    end
  end

  class ProductsAPI
    def initialize(client)
      @client = client
    end

    def list(limit: 100)
      @client.request('GET', '/v1/products', params: { limit: limit })
    end

    def get(product_id)
      @client.request('GET', "/v1/products/#{product_id}")
    end

    def create(data)
      @client.request('POST', '/v1/products', body: data)
    end
  end

  class DeploymentsAPI
    def initialize(client)
      @client = client
    end

    def list
      @client.request('GET', '/v1/deployments')
    end

    def create(product_id:, environment:)
      @client.request('POST', '/v1/deployments', body: {
        product_id: product_id,
        environment: environment
      })
    end

    def get_status(deployment_id)
      @client.request('GET', "/v1/deployments/#{deployment_id}")
    end
  end
end

# Usage example:
# client = BlackRoad::Client.new(api_key: 'your-api-key')
# products = client.products.list
# deployment = client.deployments.create(product_id: 'product-123', environment: 'production')
