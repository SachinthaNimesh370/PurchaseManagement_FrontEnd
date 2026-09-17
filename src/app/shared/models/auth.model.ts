export interface LoginRequest {
  email: string;
  password: string;
}

export interface LocationDto {
  // Backend uses [JsonPropertyName("Location_Code")] and [JsonPropertyName("Location_Name")]
  Location_Code?: string;
  Location_Name?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  email?: string;
  userLocations?: LocationDto[];
}
