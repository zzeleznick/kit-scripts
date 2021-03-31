// Menu: Kit Time
// Description: Display time
// Author: Zach Zeleznick
// Twitter: @zzxiv

// inspired by https://time.is/Unix

let interval;

const now = () => (new Date()).getTime()

const buildDisplay = () => {
  const t = now();
  return {
    name: t.toString().slice(0,10),
    value: t,
    description: Date(t),
  }
}

const updateChoices = () => {
  process.send({from: 'UPDATE_PROMPT_CHOICES', choices: [ buildDisplay() ]});
}

interval = setInterval(updateChoices, 1000);

await arg("Unix time now", [ buildDisplay() ]);
