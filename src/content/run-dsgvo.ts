import { checkArt13_14 } from "./checks/art13_14";
import { checkArt25 } from "./checks/art25";
import { checkArt7 } from "./checks/art7";

/* -----
  DSGVO Content Script Checks
  Source: Europäische Union, 2016
  - Art. 7 DSGVO: Consent vor Cookie-Setzung
  - Art. 13/14 DSGVO: Informationspflicht / Datenschutzerklärung
  - Art. 25 DSGVO: Privacy by Design
----- */

export function runDsgvoChecks() {
  return {
    art7: checkArt7(),
    art13_14: checkArt13_14(),
    art25: checkArt25(),
  };
}