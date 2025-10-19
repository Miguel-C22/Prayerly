import {
  Pinecone,
  RecordMetadata,
  RerankResult,
  ScoredPineconeRecord,
} from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? "",
});

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
}

export interface RerankInputDocument {
  id: string;
  text: string;
  [key: string]: unknown;
}

// Searches for similar vectors in a Pinecone index and returns the top K matches
export async function queryVectors(
  indexName: string,
  vector: number[],
  topK: number = 10,
  includeMetadata: boolean = true
): Promise<ScoredPineconeRecord<RecordMetadata>[]> {
  try {
    const index = pc.index(indexName);

    const queryResponse = await index.query({
      vector,
      topK,
      includeMetadata,
    });

    return queryResponse.matches ?? [];
  } catch (error) {
    console.error("Error querying vectors from Pinecone:", error);
    throw error;
  }
}

// Re-ranks documents based on their relevance to a query using Pinecone's reranking model
export async function rerank(
  query: string,
  documents: RerankInputDocument[],
  topK: number = 5
): Promise<RerankResult> {
  try {
    const rerankedResponse = await pc.inference.rerank(
      "bge-reranker-v2-m3",
      query,
      // Ensure the object values are strings per Pinecone typings
      documents.map((doc) => ({
        id: String(doc.id),
        text: String(doc.text),
      })),
      {
        returnDocuments: true,
        topN: topK,
      }
    );

    return rerankedResponse;
  } catch (error) {
    console.error("Error reranking with Pinecone:", error);
    throw error;
  }
}
