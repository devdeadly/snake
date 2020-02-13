export const areEqualArrays = (a1: number[], a2: number[]): boolean => {
  if (a1.length !== a2.length) return false;
  for (let i = 0; i < a1.length; i++) if (a1[i] !== a2[i]) return false;
  return true;
};
