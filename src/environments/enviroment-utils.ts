export function envValueResolver(string: string, env: any): string {
  return string
    .replace(new RegExp('\\$\\{server\\}', 'ig'), env.api.server)
    .replace(new RegExp('\\$\\{serverContext\\}', 'ig'), env.api.serverContext)
    .replace(new RegExp('\\$\\{backend\\}', 'ig'), env.api.backend)
    .replace(new RegExp('\\$\\{apiKey\\}', 'ig'), env.api.apiKey)
    .replace(new RegExp('\\$\\{apiKeyOLAV\\}', 'ig'), env.api.apiKeyOLAV || env.api.apiKey)
    .replace(new RegExp('\\$\\{apiKeyOLMERA\\}', 'ig'), env.api.apiKeyOLMERA || env.api.apiKey)
    .replace(new RegExp('\\$\\{apiKeyOLIWA\\}', 'ig'), env.api.apiKeyOLIWA || env.api.apiKey)
    .replace(new RegExp('\\$\\{hmacKey\\}', 'ig'), env.api.hmacKey)
    .replace(new RegExp('\\$\\{email\\}', 'ig'), env.data.email)
    .replace(new RegExp('\\$\\{ags\\}', 'ig'), env.data.ags)
}
