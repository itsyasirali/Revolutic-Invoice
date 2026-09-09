export interface HealthDbResponse {
  status: "connected" | "error";
  timestamp: string;
  config: {
    hasHostOrUrl: boolean;
    host?: string;
    hasUser: boolean;
    hasDatabase: boolean;
    hasAuthSecret: boolean;
    isProduction: boolean;
  };
  tablesFound?: number;
  entityCounts?: Record<string, number>;
  customerSampleTest?: string;
  error?: string;
}
