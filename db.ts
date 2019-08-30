import Mysql, { getMySQLInstance } from "./mysql";
import ClipTable, { DBClipWithVoters } from './clip-table';
import VoteTable from "./vote-table";

export interface Sentence {
    id: string;
    text: string;
}

export default class DB {
    clip: ClipTable;
    mysql: Mysql;
    vote: VoteTable;
  
    constructor() {
      this.mysql = getMySQLInstance();
      this.clip = new ClipTable(this.mysql);
      this.vote = new VoteTable(this.mysql);
    }

    async getAllValidClips(): Promise<DBClipWithVoters[]> {
        const [clips] = await this.mysql.query(
          `
          SELECT *
          FROM (
            SELECT clips.*
            FROM clips
            LEFT JOIN sentences on clips.original_sentence_id = sentences.id
            WHERE is_valid IS true
          ) t
        `);
        for (const clip of clips) {
          clip.voters = clip.voters ? clip.voters.split(',') : [];
        }
        return clips as DBClipWithVoters[];
      }
}
