// Menu: Big List
// Description: Create a large display list
// Author: Zach Zeleznick
// Twitter: @zzxiv


const buildArray = (n) => {
  let a = new Array(n);
  for (let i = 0; i < n; i++) {
    a[i] = i + 1;
  }
  return a
}

const buildChoices = (n) => {
  return buildArray(n).map((value) => {
    return {
      name: `List item: ${value}`,
      value,
    }
  });
}

const initialChoices = [
  {
    name: "Size: 1",
    value: 1,
  },
  {
    name: "Size: 10",
    value: 10,
  },
  {
    name: "Size: 50",
    value: 50,
  },
  {
    name: "Size: 150",
    value: 150,
  },
  {
    name: "Size: 500",
    value: 500,
  },
]

const size = await arg("Select a size:", initialChoices);
await arg("View items:", buildChoices(size));
