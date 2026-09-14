export const getSafeHex = (color: string): string => {
  if (!color) return "#000000";
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)) {
    if (color.length === 4) {
      return (
        "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
      );
    }
    return color;
  }
  return "#000000";
};
