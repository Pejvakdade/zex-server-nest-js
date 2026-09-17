/** --------------------------------------------------------------------------------------------------------------------
 * @file location.namespace.ts
 * @fileOverview types for datacenter locations. Shape follows the reference Locations page 1:1.
 */
import { AbstractEntity } from '@libs/database/src/postgres';

export namespace LocationNamespace {
  export const TABLE_NAME = 'location';

  export interface ILocation extends AbstractEntity {
    city: string;
    country: string;
    /** Regional-indicator flag, e.g. 🇩🇪 — the reference renders it as text, not an image. */
    flag: string;
    /** Facility name, e.g. "Equinix FR5". */
    datacenter: string;
    /** Network tier line, e.g. "10Gbps+ Premium". */
    network: string;
    /** The label varies per site ("Latency to EU" vs "Latency to Nordics"), so both parts are stored. */
    latencyLabel: string;
    latencyValue: string;
    /** Which products can be deployed here, as shown on the location card. */
    products: Array<string>;
    description: string;
    /**
     * Only five of the eight sites have coordinates in the reference's map file, so these are
     * nullable — a missing coordinate stays null rather than being guessed.
     */
    latitude?: number | null;
    longitude?: number | null;
    isActive: boolean;
    sortOrder: number;
  }
}
