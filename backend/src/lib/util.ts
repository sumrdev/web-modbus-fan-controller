export const validateIP = (ip: string) => {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip
  );
};

export const clb = (n: number) => {
  return (n & 0xff).toString().padStart(2, "0");
};

export const chb = (n: number) => {
  return ((n >> 8) & 0xff).toString().padStart(2, "0");
};

export const insert = (str: string, index: number, value: string) => {
  return str.substring(0, index) + value + str.substring(index);
};

export const bytesToASCII = (numbers: number[]) =>
  numbers
    .map((num) => [num >> 8, num & 0xff]) // Extract higher and lower bytes
    .reduce(
      (acc, [higherByte, lowerByte]) =>
        acc + String.fromCharCode(higherByte) + String.fromCharCode(lowerByte),
      ""
    );
