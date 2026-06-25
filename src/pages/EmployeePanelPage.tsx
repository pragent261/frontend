import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Employee = {
  id: string;
  name: string;
};

export default function EmployeePanelPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/v1/employees");
      if (!response.ok) {
        throw new Error("加载员工列表失败");
      }
      const data = (await response.json()) as { items: Employee[] };
      setEmployees(data.items ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const addEmployee = async () => {
    if (!name.trim()) {
      return;
    }
    setError(null);
    try {
      const response = await apiFetch("/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() })
      });
      if (!response.ok) {
        throw new Error("添加员工失败");
      }
      setName("");
      await loadEmployees();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>员工控制面板</h2>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="输入员工姓名"
          style={{ padding: "4px 8px" }}
        />
        <button type="button" onClick={addEmployee}>
          添加员工
        </button>
        <button type="button" onClick={loadEmployees}>
          刷新
        </button>
      </div>

      {loading && <p>加载中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {employees.map((employee) => (
          <li key={employee.id}>
            {employee.name}（{employee.id}）
          </li>
        ))}
      </ul>
      {!loading && employees.length === 0 && <p>暂无员工</p>}
    </div>
  );
}
