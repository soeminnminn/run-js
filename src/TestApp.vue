<template>
  <div class="container">
    <MenuBar>
      <Menu header="File">
        <MenuGroup>
          <MenuItem shortcuts="Ctrl+N"><img class="icon" src="/icons/new-file.svg" alt=""/>New</MenuItem>
          <MenuItem shortcuts="Ctrl+O"><img class="icon" src="/icons/open-folder.svg" alt=""/>Open</MenuItem>
          <MenuItem no-icon>
            Recents
            <SubMenuGroup>
              <MenuItem shortcuts="Ctrl+1">File 0</MenuItem>
              <MenuItem shortcuts="Ctrl+2">File 1</MenuItem>
              <MenuItem shortcuts="Ctrl+3">File 2</MenuItem>
            </SubMenuGroup>
          </MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem shortcuts="Ctrl+S" no-icon>Save</MenuItem>
          <MenuItem no-icon>Save as…</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem no-icon>Exit</MenuItem>
        </MenuGroup>
      </Menu>
      <Menu header="Edit">
        <MenuGroup>
          <MenuItem no-icon disabled shortcuts="Ctrl+Z">Undo</MenuItem>
          <MenuItem no-icon disabled shortcuts="Ctrl+Y">Redo</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem shortcuts="Ctrl+X"><img class="icon" src="/icons/cut.svg" alt=""/>Cut</MenuItem>
          <MenuItem shortcuts="Ctrl+C"><img class="icon" src="/icons/copy.svg" alt=""/>Copy</MenuItem>
          <MenuItem disabled shortcuts="Ctrl+V"><img class="icon" src="/icons/paste.svg" alt=""/>Paste</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem shortcuts="Ctrl+F"><img class="icon" src="/icons/find.svg" alt=""/>Find</MenuItem>
          <MenuItem no-icon disabled shortcuts="Ctrl+F">Find next</MenuItem>
          <MenuItem shortcuts="Ctrl+H"><img class="icon" src="/icons/replace.svg" alt=""/>Replace</MenuItem>
        </MenuGroup>
      </Menu>
      <Menu header="View">
        <MenuGroup>
          <MenuItem checkable :checked="true">Toolbar</MenuItem>
          <MenuItem checkable>Menubar</MenuItem>
        </MenuGroup>
      </Menu>
      <Menu header="Help">
        <MenuGroup>
          <MenuItem no-icon>About</MenuItem>
        </MenuGroup>
      </Menu>
    </MenuBar>
    <hr />
    <MenuDropdown>
      <span class="hamburger">≡</span>
      <template #menu>
        <MenuGroup>
          <MenuItem shortcuts="Ctrl+N"><img class="icon" src="/icons/new-file.svg" alt=""/>New</MenuItem>
          <MenuItem shortcuts="Ctrl+O"><img class="icon" src="/icons/open-folder.svg" alt=""/>Open</MenuItem>
          <MenuItem no-icon>
            Recents
            <SubMenuGroup>
              <MenuItem shortcuts="Ctrl+1">File 0</MenuItem>
              <MenuItem shortcuts="Ctrl+2">File 1</MenuItem>
              <MenuItem shortcuts="Ctrl+3">File 2</MenuItem>
            </SubMenuGroup>
          </MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem shortcuts="Ctrl+S" no-icon>Save</MenuItem>
          <MenuItem no-icon>Save as…</MenuItem>
        </MenuGroup>
      </template>
    </MenuDropdown>
    <MenuDropdown :showArrow="false">
      <span class="vert-menu">⁝</span>
      <template #menu>
        <MenuGroup>
          <MenuItem shortcuts="Ctrl+N"><img class="icon" src="/icons/new-file.svg" alt=""/>New</MenuItem>
          <MenuItem shortcuts="Ctrl+O"><img class="icon" src="/icons/open-folder.svg" alt=""/>Open</MenuItem>
          <MenuItem no-icon>
            Recents
            <SubMenuGroup>
              <MenuItem shortcuts="Ctrl+1">File 0</MenuItem>
              <MenuItem shortcuts="Ctrl+2">File 1</MenuItem>
              <MenuItem shortcuts="Ctrl+3">File 2</MenuItem>
            </SubMenuGroup>
          </MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem shortcuts="Ctrl+S" no-icon>Save</MenuItem>
          <MenuItem no-icon>Save as…</MenuItem>
        </MenuGroup>
      </template>
    </MenuDropdown>
    <hr />
    <div class="side-menu">
      <Menu>
        <MenuGroup>
          <MenuItem shortcuts="Ctrl+N"><img class="icon" src="/icons/new-file.svg" alt=""/>New</MenuItem>
          <MenuItem shortcuts="Ctrl+O"><img class="icon" src="/icons/open-folder.svg" alt=""/>Open</MenuItem>
          <MenuItem no-icon>
            Recents
            <SubMenuGroup>
              <MenuItem shortcuts="Ctrl+1">File 0</MenuItem>
              <MenuItem shortcuts="Ctrl+2">File 1</MenuItem>
              <MenuItem shortcuts="Ctrl+3">File 2</MenuItem>
            </SubMenuGroup>
          </MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem shortcuts="Ctrl+S" no-icon>Save</MenuItem>
          <MenuItem no-icon>Save as…</MenuItem>
        </MenuGroup>
      </Menu>
    </div>
    <Highlight :code="jsonCode" language="jsx" />
  </div>
</template>

<style scoped>
.container {
  max-width: 1024px;
  margin: 2rem auto;
}
.hamburger {
  display: inline-block;
  font-size: 2.5rem;
  padding: 0 0.5rem;
  transform: scaleX(1.3) scaleY(0.9);
}
.vert-menu {
  display: inline-block;
  font-size: 2rem;
  padding: 0 1rem;
}
.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  background-color: #fff;
  color: #3a3c42;
  height: 100vh;
  padding-top: 1rem;
}
</style>

<script>
import Highlight from './lib/components/Highlight.vue';
import MenuBar, { MenuDropdown, Menu, MenuGroup, MenuItem, SubMenuGroup } from './lib/components/Menu.vue';

const exampleCode = `
(function someDemo() {
  var test = "Hello World!";
  console.log(test);
})();

return () => <App />;
`;

function Person(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;
}

export default {
  name: 'App',
  components: {
    Highlight,
    MenuBar,
    MenuDropdown,
    Menu,
    MenuGroup, 
    MenuItem, 
    SubMenuGroup,
  },
  data() {
    const tyrone = new Person("Tyrone", "Jones");
    const janet = new Person("Janet", "Smith");
    const maria = new Person("Maria", "Cruz");

    const family = {};
    family.mother = new Person("Janet", "Jones");
    family.father = new Person("Tyrone", "Jones");
    family.daughter = new Person("Maria", "Jones");

    return {
      tabularData0: ["apples", "oranges", "bananas"],
      tabularData1: new Person("Tyrone", "Jones"),
      tabularData2: [
        ["Tyrone", "Jones"],
        ["Janet", "Smith"],
        ["Maria", "Cruz"],
      ],
      tabularData3: [tyrone, janet, maria],
      tabularData4: family,
      columns: ['firstName'],
    };
  },
  computed: {
    jsonCode() {
      // return JSON.stringify(this.$data);
      return exampleCode;
    }
  }
}
</script>