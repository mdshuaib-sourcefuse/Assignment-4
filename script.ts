enum Roles {
  SUPERADMIN = "SuperAdmin",
  ADMIN = "Admin",
  SUBSCRIBER = "Subscriber",
}

function DateTimeFormatter() {
  return function (target: any, propertyKey: string) {
    let value: Date | undefined;

    Object.defineProperty(target, propertyKey, {
      get() {
        if (!value) return "";
        return (
          value.toLocaleDateString("en-IN") +
          " " +
          value.toLocaleTimeString("en-IN")
        );
      },
      set(newVal: Date) {
        value = newVal;
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
    this._rawCreatedAt = createdAt;
    this.createdAt = createdAt;
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
  if (user.email.indexOf("@") === -1) errors.push("Invalid email");

  if (user.phone.length !== 10) errors.push("Phone must be 10 digits");
  if (!user.address.trim()) errors.push("Address is required");

  return errors;
}

class GenericStore<T extends { editing: boolean }> {
  private items: T[];
  private original: T[];

  constructor(data: T[]) {
    this.items = data.map((d) => this.clone(d));
    this.original = data.map((d) => this.clone(d));
  }

  private clone(obj: any): T {
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

  add(item: T): void {
    this.items.push(this.clone(item));
  }

  update(index: number, item: T): void {
    this.items[index] = this.clone(item);
  }

  delete(index: number): void {
    this.items.splice(index, 1);
  }

  reset(): void {
    this.items = this.original.map((d) => this.clone(d));
  }

  setEditing(index: number, value: boolean): void {
    const item = this.items[index];
    if (!item) return;
    item.editing = value;
  }
}

class UserTable {
  private tableBody = document.getElementById(
    "tableBody"
  ) as HTMLTableSectionElement;

  private loadBtn = document.getElementById("loadBtn") as HTMLButtonElement;
  private addBtn = document.getElementById("addUserBtn") as HTMLButtonElement;

  private isLoaded = false;

  constructor(private store: GenericStore<User>) {
    this.loadBtn.addEventListener("click", () => {
      document.getElementById("userTable")!.style.display = "table";

      if (!this.isLoaded) {
        this.render();
        this.isLoaded = true;
        this.loadBtn.innerText = "Refresh Data";
      } else {
        this.store.reset();
        this.render();
      }
    });

    this.addBtn.addEventListener("click", () => this.addUser());
  }

  private input(
    row: HTMLTableRowElement | undefined,
    index: number
  ): string {
    if (!row) return "";

    const cell = row.cells[index];
    if (!cell) return "";

    const el = cell.querySelector("input, select") as
      | HTMLInputElement
      | HTMLSelectElement
      | null;

    return el ? el.value : "";
  }

  addUser(): void {
    const user = new User(
      "",
      "",
      "",
      "",
      "",
      Roles.SUBSCRIBER,
      "",
      new Date(),
      true
    );

    this.store.add(user);
    this.render();
  }

  save(index: number): void {
    const row = this.tableBody.rows.item(index);
    if (!row) return;

    const oldUser = this.store.getAll()[index];
    if (!oldUser) return;

    const user = new User(
      this.input(row, 0),
      this.input(row, 1),
      this.input(row, 2),
      this.input(row, 3),
      this.input(row, 4),
      this.input(row, 5) as Roles,
      this.input(row, 6),
      oldUser.getRawCreatedAt()
    );

    const errors = validateUser(user);
    if (errors.length) {
      alert(errors.join("\n"));
      return;
    }

    user.editing = false;
    this.store.update(index, user);
    this.render();
  }

  edit(index: number): void {
    this.store.setEditing(index, true);
    this.render();
  }

  cancel(): void {
    this.store.reset();
    this.render();
  }

  remove(index: number): void {
    this.store.delete(index);
    this.render();
  }

  render(): void {
    this.tableBody.innerHTML = "";

    this.store.getAll().forEach((u, i) => {
      this.tableBody.innerHTML += u.editing
        ? `
        <tr>
          <td><input value="${u.first}"></td>
          <td><input value="${u.middle}"></td>
          <td><input value="${u.last}"></td>
          <td><input value="${u.email}"></td>
          <td><input value="${u.phone}"></td>
          <td>
            <select>
              <option ${u.role === Roles.SUPERADMIN ? "selected" : ""}>SuperAdmin</option>
              <option ${u.role === Roles.ADMIN ? "selected" : ""}>Admin</option>
              <option ${u.role === Roles.SUBSCRIBER ? "selected" : ""}>Subscriber</option>
            </select>
          </td>
          <td><input value="${u.address}"></td>
          <td>${u.createdAt}</td>
          <td>
            <button onclick="table.save(${i})">Save</button>
            <button onclick="table.cancel()">Cancel</button>
          </td>
        </tr>`
        : `
        <tr>
          <td>${u.first}</td>
          <td>${u.middle}</td>
          <td>${u.last}</td>
          <td>${u.email}</td>
          <td>${u.phone}</td>
          <td>${u.role}</td>
          <td>${u.address}</td>
          <td>${u.createdAt}</td>
          <td>
            <button onclick="table.edit(${i})">Edit</button>
            <button onclick="table.remove(${i})">Delete</button>
          </td>
        </tr>`;
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const store = new GenericStore<User>(userData);
  (window as any).table = new UserTable(store);
});
