import { useState } from "react";
import Button from "../ui/Button";
import supabase from "../services/supaBase";

function CheckSchema() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function checkGuestsTable() {
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      // Check if the guests table exists
      const { data: tables, error: tablesError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public");

      if (tablesError) {
        throw new Error(`Error checking tables: ${tablesError.message}`);
      }

      const guestsTableExists = tables?.some((t) => t.table_name === "guests");
      if (!guestsTableExists) {
        setMessage(
          "The 'guests' table does not exist. Please create it first."
        );
        return;
      }

      // Get the columns of the guests table
      const { data: columns, error: columnsError } = await supabase
        .from("guests")
        .select("*")
        .limit(0);

      if (columnsError) {
        throw new Error(`Error checking columns: ${columnsError.message}`);
      }

      const availableColumns = columns ? Object.keys(columns[0] || {}) : [];
      setMessage(
        `Available columns in guests table: ${availableColumns.join(", ")}`
      );

      // Check if nationalID column exists
      const hasNationalID = availableColumns.includes("nationalID");
      if (!hasNationalID) {
        setMessage(
          (prev) =>
            `${prev}\n\nThe 'nationalID' column is missing. You need to add it to your Supabase table.`
        );
      } else {
        setMessage((prev) => `${prev}\n\nThe 'nationalID' column exists.`);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        marginTop: "2rem",
        backgroundColor: "#f8fafc",
        padding: "1.5rem",
        borderRadius: "5px",
        border: "1px solid #cbd5e1",
        maxWidth: "600px",
      }}
    >
      <h3 style={{ marginBottom: "1rem" }}>Database Schema Check</h3>

      <Button onClick={checkGuestsTable} disabled={isLoading}>
        Check Guests Table Schema
      </Button>

      {message && (
        <pre
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#f1f5f9",
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            fontSize: "1.4rem",
          }}
        >
          {message}
        </pre>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>
      )}

      {isLoading && <p>Checking schema...</p>}

      <div style={{ marginTop: "1.5rem" }}>
        <h4>How to fix missing columns:</h4>
        <ol
          style={{ fontSize: "1.4rem", lineHeight: "1.6", marginLeft: "2rem" }}
        >
          <li>Go to your Supabase dashboard</li>
          <li>Navigate to the Table Editor</li>
          <li>Select the guests table</li>
          <li>Click Edit table</li>
          <li>Add a new column named nationalID with type text</li>
          <li>Save the changes</li>
        </ol>
      </div>
    </div>
  );
}

export default CheckSchema;
