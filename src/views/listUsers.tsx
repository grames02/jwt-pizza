import React from "react";
import View from "./view";
import Button from "../components/button";
import { pizzaService } from "../service/service";
import { UserList } from "../service/pizzaService";

export default function ListUsers() {
  const [userList, setUserList] = React.useState<UserList>({
    users: [],
    more: false,
  });
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState("*");
  const [filterInput, setFilterInput] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const result = await pizzaService.getUsers(page, 10, filter);

        if (!cancelled) {
          setUserList(result);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load users. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [page, filter]);

  function applyFilter() {
    setPage(1);
    setFilter(filterInput.trim() ? `*${filterInput.trim()}*` : "*");
  }

  return (
    <View title="User Management">
      <main className="p-4 sm:p-8">
        <h3 className="text-xl text-white mb-4">Users</h3>

        <form
          className="flex flex-wrap items-center gap-2 mb-4"
          onSubmit={(event) => {
            event.preventDefault();
            applyFilter();
          }}
        >
          <label htmlFor="user-filter" className="text-white">
            Filter by name
          </label>
          <input
            id="user-filter"
            value={filterInput}
            onChange={(event) => setFilterInput(event.target.value)}
            placeholder="User name"
            className="rounded border border-gray-300 p-2"
          />
          <Button title="Search" onPress={applyFilter} />
        </form>

        {loading && <p role="status">Loading users...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto bg-neutral-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-400">
                  <tr>
                    <th scope="col" className="p-3 text-left">
                      Name
                    </th>
                    <th scope="col" className="p-3 text-left">
                      Email
                    </th>
                    <th scope="col" className="p-3 text-left">
                      Role
                    </th>
                    <th scope="col" className="p-3 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userList.users.map((user, index) => (
                    <tr
                      key={user.id ?? `${user.email}-${index}`}
                      className="border-t border-gray-200"
                    >
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        {user.roles?.map((role) => role.role).join(", ")}
                      </td>
                      <td>
                        <Button
                          title="Delete"
                          onPress={async () => {
                            if (!window.confirm(`Delete user ${user.name}?`)) {
                              return;
                            }

                            try {
                              await pizzaService.deleteUser(user.id);
                              setUserList((current) => ({
                                ...current,
                                users: current.users.filter(
                                  (item) => item.id !== user.id,
                                ),
                              }));
                            } catch {
                              setError(
                                "Failed to delete user. Please try again.",
                              );
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {userList.users.length === 0 && (
              <p className="text-white mt-4">No users found.</p>
            )}

            <div className="flex items-center justify-between mt-4">
              <Button
                title="Previous"
                onPress={() => setPage((current) => current - 1)}
                disabled={page <= 1}
              />
              <span className="text-white">Page {page}</span>
              <Button
                title="Next"
                onPress={() => setPage((current) => current + 1)}
                disabled={!userList.more}
              />
            </div>
          </>
        )}
      </main>
    </View>
  );
}
