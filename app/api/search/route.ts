import { NextResponse } from "next/server";
import db from "@/lib/db";
import Files from "@/lib/models/Files";
import { fetchAICompletion } from "@/lib/ai";

// Static topic synonyms for common academic terms (fast lookup)
const TOPIC_SYNONYMS: Record<string, string[]> = {
  // Database normalization forms
  "1nf": ["first normal form", "normalization", "database", "dbms", "relational"],
  "2nf": ["second normal form", "normalization", "database", "dbms", "relational", "functional dependency"],
  "3nf": ["third normal form", "normalization", "database", "dbms", "relational", "transitive dependency"],
  "bcnf": ["boyce codd normal form", "normalization", "database", "dbms"],
  "4nf": ["fourth normal form", "normalization", "database", "multivalued dependency"],
  "5nf": ["fifth normal form", "normalization", "database", "join dependency"],
  "normalization": ["1nf", "2nf", "3nf", "bcnf", "normal form", "database", "dbms"],
  
  // Data structures
  "dsa": ["data structures", "algorithms", "array", "linked list", "tree", "graph", "sorting"],
  "linked list": ["dsa", "data structures", "pointer", "node"],
  "binary tree": ["dsa", "data structures", "tree", "bst", "traversal"],
  "graph": ["dsa", "data structures", "bfs", "dfs", "dijkstra", "adjacency"],
  
  // OOP concepts
  "oop": ["object oriented", "class", "inheritance", "polymorphism", "encapsulation", "abstraction"],
  "inheritance": ["oop", "extends", "derived class", "base class", "parent child"],
  "polymorphism": ["oop", "overloading", "overriding", "virtual"],
  
  // OS concepts
  "os": ["operating system", "process", "thread", "scheduling", "memory management"],
  "deadlock": ["os", "operating system", "resource allocation", "banker algorithm"],
  "scheduling": ["os", "operating system", "fcfs", "sjf", "round robin", "priority"],
  "paging": ["os", "operating system", "memory", "page table", "virtual memory"],
  
  // Networking
  "cn": ["computer networks", "networking", "tcp", "udp", "osi", "protocol"],
  "osi": ["cn", "networking", "layer", "protocol", "tcp ip"],
  "tcp": ["cn", "networking", "protocol", "transport layer", "connection"],
  
  // Machine Learning / AI
  "ml": ["machine learning", "neural network", "deep learning", "classification", "regression"],
  "ai": ["artificial intelligence", "machine learning", "neural network", "deep learning"],
  "cnn": ["convolutional neural network", "deep learning", "image", "computer vision"],
  "rnn": ["recurrent neural network", "deep learning", "sequence", "lstm"],
  
  // Web Development
  "html": ["web", "frontend", "markup", "css", "javascript"],
  "css": ["web", "frontend", "styling", "html", "responsive"],
  "react": ["web", "frontend", "javascript", "component", "hooks", "jsx"],
  "node": ["backend", "javascript", "express", "server", "api"],
  
  // Programming Languages
  "python": ["programming", "django", "flask", "pandas", "numpy"],
  "java": ["programming", "oop", "jvm", "spring", "android"],
  "c++": ["programming", "cpp", "oop", "stl", "pointer"],
};

// Try to expand query using AI for unknown terms (cached per session)
const aiExpandedCache = new Map<string, string[]>();

async function expandQueryWithAI(query: string): Promise<string[]> {
  const lowerQuery = query.toLowerCase();
  
  // Check static synonyms first
  if (TOPIC_SYNONYMS[lowerQuery]) {
    return [query, ...TOPIC_SYNONYMS[lowerQuery]];
  }
  
  // Check cache
  if (aiExpandedCache.has(lowerQuery)) {
    return aiExpandedCache.get(lowerQuery)!;
  }
  
  // For short queries or academic-looking terms, try AI expansion
  if (query.length >= 2 && query.length <= 30) {
    try {
      const aiResponse = await fetchAICompletion([
        {
          role: "system",
          content: "You are a search query expander for an academic notes platform. Given a search term, return 3-5 related academic terms/synonyms that would help find relevant study materials. Return ONLY comma-separated terms, no explanations."
        },
        {
          role: "user",
          content: `Expand this search term for academic notes: "${query}"`
        }
      ], 100);
      
      const expanded = aiResponse
        .split(",")
        .map((t: string) => t.trim().toLowerCase())
        .filter((t: string) => t.length > 1 && t.length < 50);
      
      const result = [query, ...expanded];
      aiExpandedCache.set(lowerQuery, result);
      return result;
    } catch (err) {
      console.warn("AI query expansion failed, using original query");
    }
  }
  
  return [query];
}

export async function GET(req: Request) {
  try {
    await db();

    let q = "";

    // --- Safe URL Parsing ---
    try {
      const base = process.env.URL || "http://localhost:3000";
      const { searchParams } = new URL(req.url, base);
      q = (searchParams.get("q") || "").trim();
    } catch (err) {
      // Fallback parser — never throw
      try {
        const raw = String(req.url);
        const qs = raw.includes("?") ? raw.split("?")[1] : "";
        q = (new URLSearchParams(qs).get("q") || "").trim();
      } catch {
        q = "";
      }
    }

    // --- Direct lookup by _id ---
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(q);

    if (q && isObjectId) {
      const doc = await Files.findById(q).lean();
      if (doc) return NextResponse.json(doc);
    }

    // --- AI-Enhanced Search with Topic Expansion ---
    let query: any = {};
    
    if (q) {
      const expandedTerms = await expandQueryWithAI(q);
      
      // Build OR query for all expanded terms
      const orConditions = expandedTerms.flatMap((term) => [
        { title: { $regex: term, $options: "i" } },
        { subject: { $regex: term, $options: "i" } },
        { hints: { $regex: term, $options: "i" } },
        { aiDescription: { $regex: term, $options: "i" } },
        { aiSummary: { $regex: term, $options: "i" } },
      ]);
      
      query = { $or: orConditions };
    }

    const results = await Files.find(query)
      .limit(20)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("/api/search error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
