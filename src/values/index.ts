/** --------------------------------------------------------------------------------------------------------------------
 * @file index.ts
 * @fileOverview this file will serve all other values in one scope
 * @author Arash Goharrostami
 * @create 2026-04-07 / Tuesday - April 07, 2026
 * @u
 */

import httpCodeMessage from './httpCodeMessage';
import globalRoutes from './globalRoutes';
import statusCode from './statusCode';
import asciiArts from './asciiArts';

import * as constants from './constants';

/** --------------------------------------------------------------------------------------------------------------------
 * @define just semple type
 */
type IMainValues = {
  httpCodeMessage: typeof httpCodeMessage;
  globalRoutes: typeof globalRoutes;
  statusCode: typeof statusCode;
  asciiArts: typeof asciiArts;
  constants: typeof constants;
};

/** --------------------------------------------------------------------------------------------------------------------
 * @define main variable of this file
 */
const mainValues: IMainValues = {
  httpCodeMessage,
  globalRoutes,
  statusCode,
  asciiArts,
  constants,
};

/** --------------------------------------------------------------------------------------------------------------------
 * @define export main variable as default
 */
export default mainValues;
