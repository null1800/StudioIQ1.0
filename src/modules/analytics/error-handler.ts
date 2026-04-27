export function handleYouTubeError(error: any) {
  if (error?.message?.includes('quota')) {
    return { code: 'QUOTA_EXCEEDED', retryable: false };
  }

  if (error?.message?.includes('429')) {
    return { code: 'RATE_LIMITED', retryable: true };
  }

  return { code: 'UNKNOWN', retryable: false };
}
