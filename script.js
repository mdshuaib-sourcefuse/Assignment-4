"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Roles;
(function (Roles) {
    Roles["SUPERADMIN"] = "SuperAdmin";
    Roles["ADMIN"] = "Admin";
    Roles["SUBSCRIBER"] = "Subscriber";
})(Roles || (Roles = {}));
function DateTimeFormatter() {
    var store = new WeakMap();
    return function (target, propertyKey) {
        Object.defineProperty(target, propertyKey, {
            get: function () {
                var value = store.get(this);
                if (!value)
                    return "";
                return (value.toLocaleDateString("en-IN") +
                    " " +
                    value.toLocaleTimeString("en-IN"));
            },
            set: function (newVal) {
                store.set(this, newVal);
            },
            enumerable: true,
            configurable: true,
        });
    };
}
var User = /** @class */ (function () {
    function User(first, middle, last, email, phone, role, address, createdAt, editing) {
        if (createdAt === void 0) { createdAt = new Date(); }
        if (editing === void 0) { editing = false; }
        this.first = first;
        this.middle = middle;
        this.last = last;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.address = address;
        this.editing = editing;
        this._rawCreatedAt = createdAt;
        this.createdAt = createdAt;
    }
    User.prototype.getRawCreatedAt = function () {
        return this._rawCreatedAt;
    };
    __decorate([
        DateTimeFormatter()
    ], User.prototype, "createdAt", void 0);
    return User;
}());
var userData = [
    new User("Amit", "K", "Sharma", "amit@gmail.com", "9876543210", Roles.SUPERADMIN, "Delhi"),
    new User("Rahul", "P", "Verma", "rahul@gmail.com", "9988776655", Roles.ADMIN, "Mumbai"),
    new User("Sana", "N", "Khan", "sana@gmail.com", "8877665544", Roles.SUBSCRIBER, "Kolkata"),
];
function validateUser(user) {
    var errors = [];
    if (!user.first.trim())
        errors.push("First name is required");
    if (!user.last.trim())
        errors.push("Last name is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
        errors.push("Invalid email");
    if (!/^\d{10,15}$/.test(user.phone))
        errors.push("Invalid phone number");
    if (!user.address.trim())
        errors.push("Address is required");
    return errors;
}
var GenericStore = /** @class */ (function () {
    function GenericStore(data, cloneFn) {
        this.cloneFn = cloneFn;
        this.items = data.map(this.cloneFn);
        this.original = data.map(this.cloneFn);
    }
    GenericStore.prototype.getAll = function () {
        return this.items;
    };
    GenericStore.prototype.add = function (item) {
        this.items.push(this.cloneFn(item));
    };
    GenericStore.prototype.update = function (index, item) {
        this.items[index] = this.cloneFn(item);
    };
    GenericStore.prototype.delete = function (index) {
        this.items.splice(index, 1);
    };
    GenericStore.prototype.reset = function () {
        this.items = this.original.map(this.cloneFn);
    };
    GenericStore.prototype.setEditing = function (index, value) {
        if (this.items[index])
            this.items[index].editing = value;
    };
    return GenericStore;
}());
var UserTable = /** @class */ (function () {
    function UserTable(store) {
        var _this = this;
        this.store = store;
        this.tableBody = document.getElementById("tableBody");
        this.loadBtn = document.getElementById("loadBtn");
        this.addBtn = document.getElementById("addUserBtn");
        this.isLoaded = false;
        this.loadBtn.addEventListener("click", function () {
            try {
                document.getElementById("userTable").style.display = "table";
                _this.isLoaded ? _this.store.reset() : (_this.isLoaded = true);
                _this.loadBtn.innerText = "Refresh Data";
                _this.render();
            }
            catch (e) {
                alert("Error while loading data");
            }
        });
        this.addBtn.addEventListener("click", function () { return _this.addUser(); });
    }
    UserTable.prototype.input = function (row, index) {
        var _a, _b;
        var el = (_a = row === null || row === void 0 ? void 0 : row.cells[index]) === null || _a === void 0 ? void 0 : _a.querySelector("input, select");
        return (_b = el === null || el === void 0 ? void 0 : el.value) !== null && _b !== void 0 ? _b : "";
    };
    UserTable.prototype.addUser = function () {
        try {
            this.store.add(new User("", "", "", "", "", Roles.SUBSCRIBER, "", new Date(), true));
            this.render();
        }
        catch (_a) {
            alert("Error while adding user");
        }
    };
    UserTable.prototype.save = function (index) {
        try {
            var row = this.tableBody.rows.item(index);
            var old = this.store.getAll()[index];
            if (!row || !old)
                return;
            var user = new User(this.input(row, 0), this.input(row, 1), this.input(row, 2), this.input(row, 3), this.input(row, 4), this.input(row, 5), this.input(row, 6), old.getRawCreatedAt());
            var errors = validateUser(user);
            if (errors.length)
                return alert(errors.join("\n"));
            user.editing = false;
            this.store.update(index, user);
            this.render();
        }
        catch (_a) {
            alert("Error while saving user");
        }
    };
    UserTable.prototype.edit = function (index) {
        this.store.setEditing(index, true);
        this.render();
    };
    UserTable.prototype.cancel = function () {
        this.store.reset();
        this.render();
    };
    UserTable.prototype.remove = function (index) {
        try {
            this.store.delete(index);
            this.render();
        }
        catch (_a) {
            alert("Error while deleting user");
        }
    };
    UserTable.prototype.render = function () {
        try {
            var users = this.store.getAll();
            this.tableBody.innerHTML = users
                .map(function (u, i) {
                return u.editing
                    ? "<tr>\n                <td><input value=\"".concat(u.first, "\"></td>\n                <td><input value=\"").concat(u.middle, "\"></td>\n                <td><input value=\"").concat(u.last, "\"></td>\n                <td><input value=\"").concat(u.email, "\"></td>\n                <td><input value=\"").concat(u.phone, "\"></td>\n                <td>\n                  <select>\n                    <option ").concat(u.role === Roles.SUPERADMIN ? "selected" : "", ">SuperAdmin</option>\n                    <option ").concat(u.role === Roles.ADMIN ? "selected" : "", ">Admin</option>\n                    <option ").concat(u.role === Roles.SUBSCRIBER ? "selected" : "", ">Subscriber</option>\n                  </select>\n                </td>\n                <td><input value=\"").concat(u.address, "\"></td>\n                <td>").concat(u.createdAt, "</td>\n                <td>\n                  <button onclick=\"table.save(").concat(i, ")\">Save</button>\n                  <button onclick=\"table.cancel()\">Cancel</button>\n                </td>\n              </tr>")
                    : "<tr>\n                <td>".concat(u.first, "</td>\n                <td>").concat(u.middle, "</td>\n                <td>").concat(u.last, "</td>\n                <td>").concat(u.email, "</td>\n                <td>").concat(u.phone, "</td>\n                <td>").concat(u.role, "</td>\n                <td>").concat(u.address, "</td>\n                <td>").concat(u.createdAt, "</td>\n                <td>\n                  <button onclick=\"table.edit(").concat(i, ")\">Edit</button>\n                  <button onclick=\"table.remove(").concat(i, ")\">Delete</button>\n                </td>\n              </tr>");
            })
                .join("");
        }
        catch (_a) {
            alert("Render error");
        }
    };
    return UserTable;
}());
document.addEventListener("DOMContentLoaded", function () {
    var store = new GenericStore(userData, function (u) {
        return new User(u.first, u.middle, u.last, u.email, u.phone, u.role, u.address, u.getRawCreatedAt(), u.editing);
    });
    window.table = new UserTable(store);
});
