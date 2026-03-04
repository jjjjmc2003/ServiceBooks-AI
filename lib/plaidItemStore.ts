const accessTokenByItemId = new Map<string, string>();

export function setPlaidItemAccessToken(itemId: string, accessToken: string) {
  accessTokenByItemId.set(itemId, accessToken);
}

export function getPlaidItemAccessToken(itemId: string) {
  return accessTokenByItemId.get(itemId);
}
