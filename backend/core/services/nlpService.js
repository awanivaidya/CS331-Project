/**
 * NLP Service Integration
 * Communicates with Python NLP analyzer to process communication content.
 */

const { spawn } = require("child_process");
const path = require("path");

class NLPService {
  constructor() {
    // Path to the Python analyzer script
    this.pythonScript = path.join(__dirname, "../../../nlpservice/analyzer.py");
  }

  /**
   * Analyze text using Python NLP service
   * @param {string} text - The communication content to analyze
   * @returns {Promise<{sentimentScore: number, sentimentCategory: string, staffTasks: string[], highPriorityCount: number}>}
   */
  async analyze(text) {
    return new Promise((resolve, reject) => {
      // Spawn Python process with --json flag
      const python = spawn("python", [
        this.pythonScript,
        "--text",
        text,
        "--json",
        "--offline",
      ]);

      let stdout = "";
      let stderr = "";

      python.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      python.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      python.on("close", (code) => {
        if (code !== 0) {
          console.error("Python NLP Error:", stderr);
          return reject(
            new Error(`NLP analysis failed with code ${code}: ${stderr}`),
          );
        }

        try {
          const result = JSON.parse(stdout);
          resolve({
            sentimentScore: result.sentiment_score,
            sentimentCategory: result.sentiment_category,
            staffTasks: result.staff_tasks,
            highPriorityCount: result.high_priority_count,
          });
        } catch (err) {
          reject(new Error(`Failed to parse NLP output: ${err.message}`));
        }
      });
    });
  }
}

module.exports = new NLPService();
