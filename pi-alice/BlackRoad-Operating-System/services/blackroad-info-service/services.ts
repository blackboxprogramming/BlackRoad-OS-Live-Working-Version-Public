import { SERVICE_BASE_URL, SERVICE_ID, SERVICE_NAME } from "./src/constants";

export const services = {
  [SERVICE_ID]: {
    name: SERVICE_NAME,
    id: SERVICE_ID,
    baseUrl: SERVICE_BASE_URL
  }
};

export type ServiceDescriptor = {
  name: string;
  id: string;
  baseUrl: string;
};

export default services;
