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
    return function (target, propertyKey) {
        var value;
        Object.defineProperty(target, propertyKey, {
            get: function () {
                if (!value)
                    return "";
                return (value.toLocaleDateString("en-IN") +
                    " " +
                    value.toLocaleTimeString("en-IN"));
            },
            set: function (newVal) {
                value = newVal;
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
    if (user.email.indexOf("@") === -1)
        errors.push("Invalid email");
    if (user.phone.length !== 10)
        errors.push("Phone must be 10 digits");
    if (!user.address.trim())
        errors.push("Address is required");
    return errors;
}
var GenericStore = /** @class */ (function () {
    function GenericStore(data) {
        var _this = this;
        this.items = data.map(function (d) { return _this.clone(d); });
        this.original = data.map(function (d) { return _this.clone(d); });
    }
    GenericStore.prototype.clone = function (obj) {
        if (obj instanceof User)
            return obj;
        return new User(obj.first, obj.middle, obj.last, obj.email, obj.phone, obj.role, obj.address, obj.createdAt ? new Date(obj.createdAt) : new Date(), obj.editing);
    };
    GenericStore.prototype.getAll = function () {
        return this.items;
    };
    GenericStore.prototype.add = function (item) {
        this.items.push(this.clone(item));
    };
    GenericStore.prototype.update = function (index, item) {
        this.items[index] = this.clone(item);
    };
    GenericStore.prototype.delete = function (index) {
        this.items.splice(index, 1);
    };
    GenericStore.prototype.reset = function () {
        var _this = this;
        this.items = this.original.map(function (d) { return _this.clone(d); });
    };
    GenericStore.prototype.setEditing = function (index, value) {
        var item = this.items[index];
        if (!item)
            return;
        item.editing = value;
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
            document.getElementById("userTable").style.display = "table";
            if (!_this.isLoaded) {
                _this.render();
                _this.isLoaded = true;
                _this.loadBtn.innerText = "Refresh Data";
            }
            else {
                _this.store.reset();
                _this.render();
            }
        });
        this.addBtn.addEventListener("click", function () { return _this.addUser(); });
    }
    UserTable.prototype.input = function (row, index) {
        if (!row)
            return "";
        var cell = row.cells[index];
        if (!cell)
            return "";
        var el = cell.querySelector("input, select");
        return el ? el.value : "";
    };
    UserTable.prototype.addUser = function () {
        var user = new User("", "", "", "", "", Roles.SUBSCRIBER, "", new Date(), true);
        this.store.add(user);
        this.render();
    };
    UserTable.prototype.save = function (index) {
        var row = this.tableBody.rows.item(index);
        if (!row)
            return;
        var oldUser = this.store.getAll()[index];
        if (!oldUser)
            return;
        var user = new User(this.input(row, 0), this.input(row, 1), this.input(row, 2), this.input(row, 3), this.input(row, 4), this.input(row, 5), this.input(row, 6), oldUser.getRawCreatedAt());
        var errors = validateUser(user);
        if (errors.length) {
            alert(errors.join("\n"));
            return;
        }
        user.editing = false;
        this.store.update(index, user);
        this.render();
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
        this.store.delete(index);
        this.render();
    };
    UserTable.prototype.render = function () {
        var _this = this;
        this.tableBody.innerHTML = "";
        this.store.getAll().forEach(function (u, i) {
            _this.tableBody.innerHTML += u.editing
                ? "\n        <tr>\n          <td><input value=\"".concat(u.first, "\"></td>\n          <td><input value=\"").concat(u.middle, "\"></td>\n          <td><input value=\"").concat(u.last, "\"></td>\n          <td><input value=\"").concat(u.email, "\"></td>\n          <td><input value=\"").concat(u.phone, "\"></td>\n          <td>\n            <select>\n              <option ").concat(u.role === Roles.SUPERADMIN ? "selected" : "", ">SuperAdmin</option>\n              <option ").concat(u.role === Roles.ADMIN ? "selected" : "", ">Admin</option>\n              <option ").concat(u.role === Roles.SUBSCRIBER ? "selected" : "", ">Subscriber</option>\n            </select>\n          </td>\n          <td><input value=\"").concat(u.address, "\"></td>\n          <td>").concat(u.createdAt, "</td>\n          <td>\n            <button onclick=\"table.save(").concat(i, ")\">Save</button>\n            <button onclick=\"table.cancel()\">Cancel</button>\n          </td>\n        </tr>")
                : "\n        <tr>\n          <td>".concat(u.first, "</td>\n          <td>").concat(u.middle, "</td>\n          <td>").concat(u.last, "</td>\n          <td>").concat(u.email, "</td>\n          <td>").concat(u.phone, "</td>\n          <td>").concat(u.role, "</td>\n          <td>").concat(u.address, "</td>\n          <td>").concat(u.createdAt, "</td>\n          <td>\n            <button onclick=\"table.edit(").concat(i, ")\">Edit</button>\n            <button onclick=\"table.remove(").concat(i, ")\">Delete</button>\n          </td>\n        </tr>");
        });
    };
    return UserTable;
}());
document.addEventListener("DOMContentLoaded", function () {
    var store = new GenericStore(userData);
    window.table = new UserTable(store);
});
//# sourceMappingURL=script.js.map