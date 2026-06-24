const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '../CHANGELOG.md');
const outputPath = path.join(__dirname, '../src/lib/changelog.json');

try {
  const content = fs.readFileSync(changelogPath, 'utf8');
  const lines = content.split('\n');

  const changelog = [];
  let currentRelease = null;
  let currentBuild = null;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Matches: ## [v0.1.2] - 2026-06-24
    const versionMatch = trimmed.match(/^##\s+\[([^\]]+)\]\s+-\s+(.+)$/);
    if (versionMatch) {
      currentRelease = {
        version: versionMatch[1],
        date: versionMatch[2]
      };
      continue;
    }

    // Matches: ### Added (Build 12 - Pruebas Automáticas y Calidad)
    // or: ### Added (Builds 5 y 6 - Checklists y Ordenamiento)
    const buildMatch = trimmed.match(/^###\s+(?:Added|Changed|Removed)\s+\((Builds?\s+[^)]+)\)$/);
    if (buildMatch) {
      const buildName = buildMatch[1];
      let displayDate = "";
      if (currentRelease) {
        const [year, month, day] = currentRelease.date.split('-');
        const monthNames = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        const monthIdx = parseInt(month, 10) - 1;
        if (monthNames[monthIdx]) {
          displayDate = `${monthNames[monthIdx]} ${year}`;
        } else {
          displayDate = currentRelease.date;
        }
      }

      currentBuild = {
        build: buildName,
        version: currentRelease ? currentRelease.version : "",
        date: displayDate,
        items: []
      };
      changelog.push(currentBuild);
      continue;
    }

    // Matches bullet points
    if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
      if (trimmed.match(/^[*-]{3,}$/)) continue;
      if (currentBuild) {
        // Strip markdown bold or link styling from display if simple parsing is preferred,
        // but keeping it as is works well for rendering text.
        const itemContent = trimmed.substring(1).trim();
        currentBuild.items.push(itemContent);
      }
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(changelog, null, 2), 'utf8');
  console.log('Changelog parsed and written to src/lib/changelog.json successfully.');
} catch (err) {
  console.error('Error generating changelog JSON:', err);
  process.exit(1);
}
