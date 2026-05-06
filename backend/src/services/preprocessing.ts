export interface Claim {
  text: string;
  source?: string;
  date?: string;
  domain?: string;
}

export const preprocessClaims = (claims: Claim[]): Claim[] => {
  return claims.map(claim => {
    // Lowercasing and basic sentence normalization
    let text = claim.text.toLowerCase().trim();
    // Simple stopword removal (could be expanded)
    const stopwords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an'];
    text = text.split(' ').filter(word => !stopwords.includes(word)).join(' ');
    
    return {
       ...claim,
       text
    };
  });
}
