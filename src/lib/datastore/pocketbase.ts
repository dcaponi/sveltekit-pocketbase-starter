import PocketBase from 'pocketbase';
import type { IDataStoreProvider } from './provider';
import { POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD } from '$env/static/private';

export class PBDataStore implements IDataStoreProvider {
    client: PocketBase

    constructor(client: PocketBase) {
      this.client = client;
    }
  
    // Searches all records where field = value
    // Will do a full table scan so be wary of scanning large tables
    // @param fields: comma separated field names
    // @param filter: <field> <op> <value>
    // @example: searchRecordsBy<Post>("posts", "authorID, title", "authorID = 2 && id != null")
    public searchRecordsBy = async <T>(tableName: string, fields: string, filter: string): Promise<T[]> => {
      try {
        let searchParams = {}
        if (fields !== "" && fields !== "*") {
          searchParams = {fields}
        }
        if (filter !== "") {
          searchParams = {...searchParams, filter}
        }
  
        const pbrecords = await this.client.collection(tableName).getFullList<T>(searchParams);
  
        return pbrecords.map((pbrecord) => {
          return {...pbrecord} as T;
        });
      } catch (e) {
        console.log("[search records error]:", e);
        return [];
      }
    }
  
    // Will create a record in the table
    public createRecord = async <T>(tableName: string, record: {[key: string]: any; } | FormData): Promise<T | null> => {
      try {
        const pbResp = await this.client.collection(tableName).create(record);
  
        if (pbResp) return {...pbResp} as T;
  
        return null;
      } catch (e) {
        console.log("[create record error]:", e);
        return null;
      }
    }
  
    // will update a record in the table where the id matches the one specified
    public updateRecord = async <T>(tableName: string, id: string, record: {[key: string]: any; } | FormData): Promise<T | null> => {
      try {
        await this.client.collection("_superusers")
          .authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
        const pbResp = await this.client.collection(tableName).update<T>(id, record);
  
        this.client.authStore.clear();
        if (pbResp) return {...pbResp} as T;
  
        return null;
      } catch (e) {
        console.log("[update record error]:", e);
        return null;
      }
    }
  }