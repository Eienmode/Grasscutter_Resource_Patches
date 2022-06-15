const fs = require('fs');
const path = require('path');

const hasMatch = (text) => {
  if (!text) return false;

  const hotWords = [
    /LanternRite/gi,
    /MusicGame/gi,
    /LunaRite/gi,
    /Mechanicus/gi,
    /Irodori/gi,
    /MichiaeMatsuri/gi,
    /potion/gi,
    /crystal/gi,
    /DrakePrimoRock/gi,
    /CustomLevel/gi,
    /ChannellerSlab/gi,
    /Effigy/gi,
    /FleurFair/gi,
    /MiniEldritch/gi,
    /Arena/gi,
    /BlitzRush/gi,
    /Roguelike/gi,
    /Sumo/gi,
    /ActivityHachi/gi,
    /GrowFlowers/gi,
    /ProjectionGame/gi,
    /HideAndSeek/gi,
    /AsterMiddle/gi,
    /Bartender/gi,
    /ActivityGachaNPC/gi,
    /ActivityBlessingNPC/gi,
    /Perpetual/gi,
    /SeaLampGiving/gi
  ];

  for (let i = 0, l = hotWords.length; i < l; i++) {
    if (hotWords[i].test(text)) return true;
  }
}

const ScenePointsFilterOnlyRequired = () => {
  const bigWorldDataPath = path.join(__dirname, '../Patches/e03c6fdd5b93a633acd729a8375fafa4f22cd0bd9407efd432f0d36a27f6550b.json');
  const bigWorldData = JSON.parse(fs.readFileSync(bigWorldDataPath));

  const newData = {
    points: {}
  };

  for (const data in bigWorldData.points) {
    if (
      !hasMatch(bigWorldData.points[data].BGMAIKOBLOI) &&
      !hasMatch(bigWorldData.points[data].ADKCGCDEANB) &&
      !hasMatch(bigWorldData.points[data].LJLEMIHFHMP) &&
      !hasMatch(bigWorldData.points[data].PFMFPKFDNEK) &&
      !hasMatch(bigWorldData.points[data].EJFPAJGPEBH)
      ) {
      newData.points[data] = bigWorldData.points[data];
      continue;
    }

    if (bigWorldData.points[data].JAGOPOODDAJ) {
      const id = bigWorldData.points[data].JAGOPOODDAJ.toString();
      if (!newData.points[id]) {
        console.log('dunegon entry not found therefore deleted id:', id);
        continue;
      }
    }

    console.log('removed: ', data);
  }

  // Save file
  fs.writeFileSync(bigWorldDataPath, JSON.stringify(newData, undefined, 2), 'utf-8');
};

ScenePointsFilterOnlyRequired();
