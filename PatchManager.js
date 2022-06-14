const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GRASSCUTTER_RESOURCE_ROOT = path.join(__dirname, './Grasscutter_Resources/');
const PATCH_HUB_ROOT = path.join(__dirname, './Patches');
const ORIGINAL_PATCH_HUB_ROOT = path.join(__dirname, './Original_Patches');
const PATCH_MAPPINGS = path.join(__dirname, './PatchMappings.json');

const prepareDirs = () => {
  if (!fs.existsSync(ORIGINAL_PATCH_HUB_ROOT)) {
    fs.mkdirSync(ORIGINAL_PATCH_HUB_ROOT);
  }

  if (!fs.existsSync(PATCH_HUB_ROOT)) {
    fs.mkdirSync(PATCH_HUB_ROOT);
  }
}

const generateSeparators = (textData) => {
  const total = !textData ? 80 : (80 - (textData.length - 1));
  let separator = !textData ? '' : `${textData} `;

  for (let i = 0; i < total; i++) {
    separator += '=';
  }

  return separator;
}

const beautifiedPrint = (heading, lines) => {
  console.log(generateSeparators(heading));

  for (let i = 0, l = lines.length; i < l; i++) {
    console.log(lines[i].key, lines[i].value);
  }

  console.log(generateSeparators());
}

const createPatch = (resourceTarget) => {
  const pathTarget = path.join(GRASSCUTTER_RESOURCE_ROOT, resourceTarget);

  if (!fs.existsSync(pathTarget)) {
    throw new Error('Invalid Resource Target. Cannot be found: ' + resourceTarget);
  }

  // Prepare dirs
  prepareDirs();

  let data = {};
  // Read json
  if (fs.existsSync(PATCH_MAPPINGS)) {
    data = JSON.parse(fs.readFileSync(PATCH_MAPPINGS, 'utf-8'));

    // Check if patch exists.
    if (data[resourceTarget]) {
      beautifiedPrint('Patch already exists. Patch Info', [
        {
          key: 'Patch: ',
          value: data[resourceTarget]
        },
        {
          key: 'Patch File: ',
          value: data[resourceTarget].Patch
        },
        {
          key: 'Original File: ',
          value: data[resourceTarget].Original
        }
      ]);
      return;
    }
  }

  // Hash the file
  const fileData = fs.readFileSync(pathTarget);
  const fileExtension = path.extname(pathTarget);
  const hash = crypto.createHash('sha256').update(fileData).digest('hex');

  // Create patches
  const patchPath = path.join(PATCH_HUB_ROOT, `${hash}${fileExtension}`);
  fs.copyFileSync(pathTarget, path.join(ORIGINAL_PATCH_HUB_ROOT, `${hash}${fileExtension}`));
  fs.copyFileSync(pathTarget, patchPath);

  data[resourceTarget] = {
    Patch: `Patches/${hash}${fileExtension}`,
    Original: `Original_Patches/${hash}${fileExtension}`
  };

  fs.writeFileSync(PATCH_MAPPINGS, JSON.stringify(data, undefined, 2));

  console.log('Edit patch here:', `Patches/${hash}${fileExtension}`);
}

const applyPatch = () => {
  const data = JSON.parse(fs.readFileSync(PATCH_MAPPINGS, 'utf-8'));

  // Apply all patches
  console.log('Applying Patches...');
  for (const key in data) {
    fs.copyFileSync(path.join(__dirname, data[key].Patch), path.join(GRASSCUTTER_RESOURCE_ROOT, key));
    console.log(`Patch ${data[key].Patch} is applied to ${key}`);
  }
}

const revertPatch = () => {
  const data = JSON.parse(fs.readFileSync(PATCH_MAPPINGS, 'utf-8'));

  // Apply all patches
  console.log('Reverting Patches...');
  for (const key of data) {
    fs.copyFileSync(path.join(__dirname, data[key].Original), path.join(GRASSCUTTER_RESOURCE_ROOT, key));
    console.log(`Reverted ${key}`);
  }
}

const commandParser = (args) => {
  if (args[2] === 'create') {
    if (!args[3]) {
      console.error('Cannot create patch. Usage for "create" command is:');
      console.error('create <target resource>');
      return;
    }

    createPatch(args[3]);
    return;
  }

  if (args[2] === 'apply') {
    applyPatch();
    return;
  }

  if (args[2] === 'revert') {
    revertPatch();
    return;
  }

  if (args[2] === 'help') {
    console.log('PatchManager 1.0.0');
    console.log('');
    console.log('create <target resource>        Creates Patch for a certain resource in Grasscutter_Resources dir');
    console.log('apply                           Applies the patch');
    console.log('revert                          Reverts the patch');
    console.log('help                            This help');
  }

  if (args[2]) {
    console.error(`Unknown command of ${args[2]}`);
    return;
  }

  console.error('No command specified.');
}

commandParser(process.argv);
