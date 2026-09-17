export interface LoginRequest {
  email: string;
  password: string;
}

export interface LocationDto {
  location_Code?: string;
  location_Name?: string;
  locationCode?: string;
  locationName?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  email?: string;
  userLocations?: LocationDto[];
}
