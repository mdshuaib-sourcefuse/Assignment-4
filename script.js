"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
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
    var privateKey = Symbol(propertyKey);
    Object.defineProperty(target, propertyKey, {
      get: function () {
        var value = this[privateKey];
        if (!value) return "";
        return (
          value.toLocaleDateString("en-IN") +
          " " +
          value.toLocaleTimeString("en-IN")
        );
      },
      set: function (newVal) {
        this[privateKey] = newVal;
      },
      enumerable: true,
      configurable: true,
    });
  };
}
var User = /** @class */ (function () {
  function User(
    first,
    middle,
    last,
    email,
    phone,
    role,
    address,
    createdAt,
    editing
  ) {
    if (createdAt === void 0) {
      createdAt = new Date();
    }
    if (editing === void 0) {
      editing = false;
    }
    this.first = first;
    this.middle = middle;
    this.last = last;
    this.email = email;
    this.phone = phone;
    this.role = role;
    this.address = address;
    this.editing = editing;
    (this.createdAt = createdAt), (this._rawCreatedAt = createdAt);
  }
  User.prototype.getRawCreatedAt = function () {
    return this._rawCreatedAt;
  };
  __decorate([DateTimeFormatter()], User.prototype, "createdAt", void 0);
  return User;
})();
var userData = [
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
function validateUser(user) {
  var errors = [];
  if (!user.first.trim()) errors.push("First name is required");
  if (!user.last.trim()) errors.push("Last name is required");
  if (!user.email || user.email.indexOf("@") === -1)
    errors.push("Invalid email");
  if (!user.phone || user.phone.length !== 10)
    errors.push("Phone must be 10 digits");
  if (!user.address.trim()) errors.push("Address is required");
  return errors;
}
var GenericStore = /** @class */ (function () {
  function GenericStore(data) {
    var _this = this;
    this.original = data.map(function (d) {
      return _this.revive(d);
    });
    this.items = data.map(function (d) {
      return _this.revive(d);
    });
  }
  GenericStore.prototype.revive = function (obj) {
    if (obj instanceof User) return obj;
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
    );
  };
  GenericStore.prototype.getAll = function () {
    return this.items;
  };
  GenericStore.prototype.reset = function () {
    var _this = this;
    this.items = this.original.map(function (d) {
      return _this.revive(d);
    });
  };
  GenericStore.prototype.delete = function (index) {
    this.items.splice(index, 1);
  };
  GenericStore.prototype.setEditing = function (index, value) {
    var item = this.items[index];
    if (!item) return;
    item.editing = value;
  };
  GenericStore.prototype.update = function (index, item) {
    this.items[index] = this.revive(item);
  };
  return GenericStore;
})();
var UserTable = /** @class */ (function () {
  function UserTable(store) {
    var _this = this;
    this.store = store;
    this.tableBody = document.getElementById("tableBody");
    this.loadBtn = document.getElementById("loadBtn");
    this.isLoaded = false;
    this.loadBtn.addEventListener("click", function () {
      if (!_this.isLoaded) {
        _this.loadData();
        _this.isLoaded = true;
        _this.loadBtn.innerText = "Refresh Data";
      } else {
        _this.refreshData();
      }
    });
  }
  UserTable.prototype.getInputValue = function (row, cellIndex) {
    var cell = row.cells.item(cellIndex);
    if (!cell) return "";
    var input = cell.querySelector("input, select");
    return input ? input.value : "";
  };
  UserTable.prototype.loadData = function () {
    document.getElementById("userTable").style.display = "table";
    this.renderTable();
  };
  UserTable.prototype.refreshData = function () {
    this.store.reset();
    this.renderTable();
  };
  UserTable.prototype.deleteUser = function (index) {
    this.store.delete(index);
    this.renderTable();
  };
  UserTable.prototype.editUser = function (index) {
    this.store.setEditing(index, true);
    this.renderTable();
  };
  UserTable.prototype.saveUser = function (index) {
    var row = this.tableBody.rows.item(index);
    if (!row) return;
    if (row.cells.length < 7) return;
    var oldUser = this.store.getAll()[index];
    if (!oldUser) return;
    var updatedUser = new User(
      this.getInputValue(row, 0),
      this.getInputValue(row, 1),
      this.getInputValue(row, 2),
      this.getInputValue(row, 3),
      this.getInputValue(row, 4),
      this.getInputValue(row, 5),
      this.getInputValue(row, 6)
    );
    // updatedUser.createdAt = oldUser.createdAt;
    updatedUser.createdAt = oldUser.getRawCreatedAt();
    var errors = validateUser(updatedUser);
    if (errors.length) {
      alert(errors.join("\n"));
      return;
    }
    updatedUser.editing = false;
    this.store.update(index, updatedUser);
    this.renderTable();
  };
  UserTable.prototype.cancelEdit = function (index) {
    this.store.setEditing(index, false);
    this.renderTable();
  };
  UserTable.prototype.renderTable = function () {
    var _this = this;
    this.tableBody.innerHTML = "";
    this.store.getAll().forEach(function (user, index) {
      var row = user.editing
        ? '\n          <tr>\n            <td><input value="'
            .concat(user.first, '"></td>\n            <td><input value="')
            .concat(user.middle, '"></td>\n            <td><input value="')
            .concat(user.last, '"></td>\n            <td><input value="')
            .concat(user.email, '"></td>\n            <td><input value="')
            .concat(
              user.phone,
              '"></td>\n            <td>\n              <select>\n                <option '
            )
            .concat(
              user.role === Roles.SUPERADMIN ? "selected" : "",
              ">SuperAdmin</option>\n                <option "
            )
            .concat(
              user.role === Roles.ADMIN ? "selected" : "",
              ">Admin</option>\n                <option "
            )
            .concat(
              user.role === Roles.SUBSCRIBER ? "selected" : "",
              '>Subscriber</option>\n              </select>\n            </td>\n            <td><input value="'
            )
            .concat(user.address, '"></td>\n            <td>')
            .concat(
              user.createdAt,
              '</td>\n            <td>\n             <button class="save-btn" data-index="'
            )
            .concat(
              index,
              '">Save</button>\n             <button class="cancel-btn" data-index="'
            )
            .concat(
              index,
              '">Cancel</button>\n            </td>\n          </tr>'
            )
        : "\n          <tr>\n            <td>"
            .concat(user.first, "</td>\n            <td>")
            .concat(user.middle, "</td>\n            <td>")
            .concat(user.last, "</td>\n            <td>")
            .concat(user.email, "</td>\n            <td>")
            .concat(user.phone, "</td>\n            <td>")
            .concat(user.role, "</td>\n            <td>")
            .concat(user.address, "</td>\n            <td>")
            .concat(
              user.createdAt,
              '</td>\n            <td>\n            <button class="edit-btn" data-index="'
            )
            .concat(
              index,
              '">Edit</button>\n            <button class="delete-btn" data-index="'
            )
            .concat(
              index,
              '">Delete</button>\n            </td>\n          </tr>'
            );
      _this.tableBody.innerHTML += row;
    });
    this.attachEvents();
  };
  UserTable.prototype.attachEvents = function () {
    var _this = this;
    this.tableBody.querySelectorAll(".save-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var index = Number(e.currentTarget.dataset.index);
        _this.saveUser(index);
      });
    });
    this.tableBody.querySelectorAll(".cancel-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var index = Number(e.currentTarget.dataset.index);
        _this.cancelEdit(index);
      });
    });
    this.tableBody.querySelectorAll(".edit-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var index = Number(e.currentTarget.dataset.index);
        _this.editUser(index);
      });
    });
    this.tableBody.querySelectorAll(".delete-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var index = Number(e.currentTarget.dataset.index);
        _this.deleteUser(index);
      });
    });
  };
  return UserTable;
})();
document.addEventListener("DOMContentLoaded", function () {
  var store = new GenericStore(userData);
  var table = new UserTable(store);
  window.table = table;
});

