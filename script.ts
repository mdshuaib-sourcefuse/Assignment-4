enum Roles {
  SUPERADMIN = "SuperAdmin",
  ADMIN = "Admin",
  SUBSCRIBER = "Subscriber",
}

function DateTimeFormatter() {
  return function (target: any, propertyKey: string) {
    const privateKey = Symbol(propertyKey);

    Object.defineProperty(target, propertyKey, {
      get() {
        const value: Date = this[privateKey];
        if (!value) return "";
        return (
          value.toLocaleDateString("en-IN") +
          " " +
          value.toLocaleTimeString("en-IN")
        );
      },
      set(newVal: Date) {
        this[privateKey] = newVal;
      },
      enumerable: true,
      configurable: true,
    });
  };
}


class User {
  private _rawCreatedAt!: Date;
  @DateTimeFormatter()
  public createdAt!: Date;

  constructor(
    public first: string,
    public middle: string,
    public last: string,
    public email: string,
    public phone: string,
    public role: Roles,
    public address: string,
    createdAt: Date = new Date(),
    public editing: boolean = false
  ) {
    (this.createdAt = createdAt), (this._rawCreatedAt = createdAt);
  }
  getRawCreatedAt(): Date {
    return this._rawCreatedAt;
  }
}

const userData: User[] = [
  new User(
    "Amit",
    "K",
    "Sharma",
    "amit@gmail.com",
    "9876543210",
    Roles.SUPERADMIN,
    "Delhi"
  ),
  new User(
    "Rahul",
    "P",
    "Verma",
    "rahul@gmail.com",
    "9988776655",
    Roles.ADMIN,
    "Mumbai"
  ),
  new User(
    "Sana",
    "N",
    "Khan",
    "sana@gmail.com",
    "8877665544",
    Roles.SUBSCRIBER,
    "Kolkata"
  ),
];

function validateUser(user: User): string[] {
  const errors: string[] = [];
  if (!user.first.trim()) errors.push("First name is required");
  if (!user.last.trim()) errors.push("Last name is required");
  if (!user.email || user.email.indexOf("@") === -1)
    errors.push("Invalid email");
  if (!user.phone || user.phone.length !== 10)
    errors.push("Phone must be 10 digits");
  if (!user.address.trim()) errors.push("Address is required");
  return errors;
}

class GenericStore<T extends { editing: boolean }> {
  private items: T[];
  private original: T[];

  constructor(data: T[]) {
    this.original = data.map((d) => this.revive(d));
    this.items = data.map((d) => this.revive(d));
  }

  private revive(obj: any): T {
    if (obj instanceof User) return obj as unknown as T;

    return new User(
      obj.first,
      obj.middle,
      obj.last,
      obj.email,
      obj.phone,
      obj.role,
      obj.address,
      obj.createdAt ? new Date(obj.createdAt) : new Date(),
      obj.editing
    ) as unknown as T;
  }

  getAll(): T[] {
    return this.items;
  }

  reset(): void {
    this.items = this.original.map((d) => this.revive(d));
  }

  delete(index: number): void {
    this.items.splice(index, 1);
  }

  setEditing(index: number, value: boolean): void {
    const item = this.items[index];
    if (!item) return;
    item.editing = value;
  }

  update(index: number, item: T): void {
    this.items[index] = this.revive(item);
  }
}

interface IUserCRUD {
  loadData(): void;
  refreshData(): void;
  deleteUser(index: number): void;
  editUser(index: number): void;
  saveUser(index: number): void;
  cancelEdit(index: number): void;
}

class UserTable implements IUserCRUD {
  private tableBody = document.getElementById(
    "tableBody"
  ) as HTMLTableSectionElement;
  private loadBtn = document.getElementById("loadBtn") as HTMLButtonElement;
  private isLoaded = false;

  constructor(private store: GenericStore<User>) {
    this.loadBtn.addEventListener("click", () => {
      if (!this.isLoaded) {
        this.loadData();

        this.isLoaded = true;

        this.loadBtn.innerText = "Refresh Data";
      } else {
        this.refreshData();
      }
    });
  }

  private getInputValue(row: HTMLTableRowElement, cellIndex: number): string {
    const cell = row.cells.item(cellIndex);
    if (!cell) return "";

    const input = cell.querySelector("input, select") as
      | HTMLInputElement
      | HTMLSelectElement
      | null;

    return input ? input.value : "";
  }

  loadData(): void {
    document.getElementById("userTable")!.style.display = "table";
    this.renderTable();
  }

  refreshData(): void {
    this.store.reset();
    this.renderTable();
  }

  deleteUser(index: number): void {
    this.store.delete(index);
    this.renderTable();
  }

  editUser(index: number): void {
    this.store.setEditing(index, true);
    this.renderTable();
  }

  saveUser(index: number): void {
    const row = this.tableBody.rows.item(index);
    if (!row) return;
    if (row.cells.length < 7) return;

    const oldUser = this.store.getAll()[index];
    if (!oldUser) return;

    const updatedUser = new User(
      this.getInputValue(row, 0),
      this.getInputValue(row, 1),
      this.getInputValue(row, 2),
      this.getInputValue(row, 3),
      this.getInputValue(row, 4),
      this.getInputValue(row, 5) as Roles,
      this.getInputValue(row, 6)
    );

    updatedUser.createdAt = oldUser.getRawCreatedAt();

    const errors = validateUser(updatedUser);
    if (errors.length) {
      alert(errors.join("\n"));
      return;
    }

    updatedUser.editing = false;
    this.store.update(index, updatedUser);
    this.renderTable();
  }

  cancelEdit(index: number): void {
    this.store.setEditing(index, false);
    this.renderTable();
  }

  private renderTable(): void {
    this.tableBody.innerHTML = "";

    this.store.getAll().forEach((user, index) => {
      const row = user.editing
        ? `
          <tr>
            <td><input value="${user.first}"></td>
            <td><input value="${user.middle}"></td>
            <td><input value="${user.last}"></td>
            <td><input value="${user.email}"></td>
            <td><input value="${user.phone}"></td>
            <td>
              <select>
                <option ${
                  user.role === Roles.SUPERADMIN ? "selected" : ""
                }>SuperAdmin</option>
                <option ${
                  user.role === Roles.ADMIN ? "selected" : ""
                }>Admin</option>
                <option ${
                  user.role === Roles.SUBSCRIBER ? "selected" : ""
                }>Subscriber</option>
              </select>
            </td>
            <td><input value="${user.address}"></td>
            <td>${user.createdAt}</td>
            <td>
             <button class="save-btn" data-index="${index}">Save</button>
             <button class="cancel-btn" data-index="${index}">Cancel</button>
            </td>
          </tr>`
        : `
          <tr>
            <td>${user.first}</td>
            <td>${user.middle}</td>
            <td>${user.last}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.role}</td>
            <td>${user.address}</td>
            <td>${user.createdAt}</td>
            <td>
            <button class="edit-btn" data-index="${index}">Edit</button>
            <button class="delete-btn" data-index="${index}">Delete</button>
            </td>
          </tr>`;

      this.tableBody.innerHTML += row;
    });
    this.attachEvents();
  }

  private attachEvents(): void {
    this.tableBody.querySelectorAll(".save-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number((e.currentTarget as HTMLElement).dataset.index);
        this.saveUser(index);
      });
    });
    this.tableBody.querySelectorAll(".cancel-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number((e.currentTarget as HTMLElement).dataset.index);
        this.cancelEdit(index);
      });
    });
    this.tableBody.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number((e.currentTarget as HTMLElement).dataset.index);
        this.editUser(index);
      });
    });
    this.tableBody.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number((e.currentTarget as HTMLElement).dataset.index);
        this.deleteUser(index);
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const store = new GenericStore<User>(userData);
  const table = new UserTable(store);
  (window as any).table = table;
});
