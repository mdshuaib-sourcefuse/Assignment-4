enum Roles {
  SUPERADMIN = "SuperAdmin",
  ADMIN = "Admin",
  SUBSCRIBER = "Subscriber",
}

function DateTimeFormatter() {
  const store = new WeakMap<object, Date>();

  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() {
        const value = store.get(this);
        if (!value) return "";
        return (
          value.toLocaleDateString("en-IN") +
          " " +
          value.toLocaleTimeString("en-IN")
        );
      },
      set(newVal: Date) {
        store.set(this, newVal);
      },
      enumerable: true,
      configurable: true,
    });
  };
}

class User {
  private _rawCreatedAt: Date;

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
  new User("Amit", "K", "Sharma", "amit@gmail.com", "9876543210", Roles.SUPERADMIN, "Delhi"),
  new User("Rahul", "P", "Verma", "rahul@gmail.com", "9988776655", Roles.ADMIN, "Mumbai"),
  new User("Sana", "N", "Khan", "sana@gmail.com", "8877665544", Roles.SUBSCRIBER, "Kolkata"),
];

function validateUser(user: User): string[] {
  const errors: string[] = [];

  if (!user.first.trim()) errors.push("First name is required");
  if (!user.last.trim()) errors.push("Last name is required");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
    errors.push("Invalid email");

  if (!/^\d{10,15}$/.test(user.phone))
    errors.push("Invalid phone number");

  if (!user.address.trim()) errors.push("Address is required");

  return errors;
}

interface IUserCRUD {
  addUser(): void;
  save(index: number): void;
  edit(index: number): void;
  cancel(): void;
  remove(index: number): void;
  render(): void;
}

class GenericStore<T extends { editing: boolean }> {
  private items: T[];
  private original: T[];

  constructor(data: T[], private cloneFn: (obj: T) => T) {
    this.items = data.map(this.cloneFn);
    this.original = data.map(this.cloneFn);
  }

  getAll(): T[] {
    return this.items;
  }

  add(item: T): void {
    this.items.push(this.cloneFn(item));
  }

  update(index: number, item: T): void {
    this.items[index] = this.cloneFn(item);
  }

  delete(index: number): void {
    this.items.splice(index, 1);
  }

  reset(): void {
    this.items = this.original.map(this.cloneFn);
  }

  setEditing(index: number, value: boolean): void {
    if (this.items[index]) this.items[index].editing = value;
  }
}

class UserTable implements IUserCRUD {
  private tableBody = document.getElementById("tableBody") as HTMLTableSectionElement;
  private loadBtn = document.getElementById("loadBtn") as HTMLButtonElement;
  private addBtn = document.getElementById("addUserBtn") as HTMLButtonElement;
  private isLoaded = false;

  constructor(private store: GenericStore<User>) {
    this.loadBtn.addEventListener("click", () => {
      try {
        document.getElementById("userTable")!.style.display = "table";
        this.isLoaded ? this.store.reset() : (this.isLoaded = true);
        this.loadBtn.innerText = "Refresh Data";
        this.render();
      } catch (e) {
        alert("Error while loading data");
      }
    });

    this.addBtn.addEventListener("click", () => this.addUser());
  }

  private input(row: HTMLTableRowElement | null, index: number): string {
    const el = row?.cells[index]?.querySelector("input, select") as
      | HTMLInputElement
      | HTMLSelectElement
      | null;
    return el?.value ?? "";
  }

  addUser(): void {
    try {
      this.store.add(new User("", "", "", "", "", Roles.SUBSCRIBER, "", new Date(), true));
      this.render();
    } catch {
      alert("Error while adding user");
    }
  }

  save(index: number): void {
    try {
      const row = this.tableBody.rows.item(index);
      const old = this.store.getAll()[index];
      if (!row || !old) return;

      const user = new User(
        this.input(row, 0),
        this.input(row, 1),
        this.input(row, 2),
        this.input(row, 3),
        this.input(row, 4),
        this.input(row, 5) as Roles,
        this.input(row, 6),
        old.getRawCreatedAt()
      );

      const errors = validateUser(user);
      if (errors.length) return alert(errors.join("\n"));

      user.editing = false;
      this.store.update(index, user);
      this.render();
    } catch {
      alert("Error while saving user");
    }
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
    try {
      this.store.delete(index);
      this.render();
    } catch {
      alert("Error while deleting user");
    }
  }

  render(): void {
    try {
      const users = this.store.getAll();
      this.tableBody.innerHTML = users
        .map((u, i) =>
          u.editing
            ? `<tr>
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
            : `<tr>
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
              </tr>`
        )
        .join("");
    } catch {
      alert("Render error");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const store = new GenericStore<User>(
    userData,
    (u) =>
      new User(
        u.first,
        u.middle,
        u.last,
        u.email,
        u.phone,
        u.role,
        u.address,
        u.getRawCreatedAt(),
        u.editing
      )
  );

  (window as any).table = new UserTable(store);
});
