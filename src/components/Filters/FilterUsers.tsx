import { memo } from 'react';
import { Badge, Button, Menu } from '@mantine/core';
import {
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconUserStar,
} from '@tabler/icons-react';
import {
  listDepts,
  listOffices,
  listOthers,
  listPos,
  listUserRoles,
} from '@/utils/user-types';
import { getDeptColor, getPosColor, getRoleColor } from '@/utils/colors';
import { Enums } from '@/libs/supabase/_database';

interface FilterUsers {
  // single selection
  single?: boolean;
}

interface FilterUserRolesProps extends FilterUsers {
  roles: Enums<'roles_user'>[];
  setRoles: (dept: Enums<'roles_user'>[]) => void;
}
interface FilterDepartmentsProps extends FilterUsers {
  dept: Enums<'roles_dept'>[];
  setDept: (dept: Enums<'roles_dept'>[]) => void;
}
interface FilterPosProps extends FilterUsers {
  pos: Enums<'roles_pos'>[];
  setPos: (pos: Enums<'roles_pos'>[]) => void;
}
interface UsersFiltersProps
  extends FilterUsers,
    FilterDepartmentsProps,
    FilterUserRolesProps,
    FilterPosProps {}

/**
 * Menu items to filter by departments.
 */
export const FilterDepartments = memo(
  ({ dept, setDept, single }: FilterDepartmentsProps) => {
    // menu items for college departments
    const deptItems = listDepts.map((cDept) => (
      <Menu.Item
        key={cDept.value}
        leftSection={dept.includes(cDept.value) && <IconCheck size={16} />}
        onClick={() => {
          if (single) {
            setDept([cDept.value]);
          } else {
            // toggle based on current state, add or remove
            if (dept.includes(cDept.value)) {
              setDept(dept.filter((d) => d !== cDept.value));
            } else {
              setDept([...dept, cDept.value]);
            }
          }
        }}
      >
        {cDept.label}
        <Badge color={getDeptColor(cDept.value)} ml={8} variant="light">
          {cDept.value.toUpperCase()}
        </Badge>
      </Menu.Item>
    ));

    // menu items for office departments
    const officeItems = listOffices.map((office) => (
      <Menu.Item
        key={office.value}
        leftSection={dept.includes(office.value) && <IconCheck size={16} />}
        onClick={() => {
          if (single) {
            setDept([office.value]);
          } else {
            // toggle based on current state, add or remove
            if (dept.includes(office.value)) {
              setDept(dept.filter((d) => d !== office.value));
            } else {
              setDept([...dept, office.value]);
            }
          }
        }}
      >
        {office.label}
        <Badge color={getDeptColor(office.value)} ml={8} variant="light">
          {office.value.toUpperCase()}
        </Badge>
      </Menu.Item>
    ));

    // menu items for other departments
    const otherItems = listOthers.map((other) => (
      <Menu.Item
        key={other.value}
        leftSection={dept.includes(other.value) && <IconCheck size={16} />}
        onClick={() => {
          if (single) {
            setDept([other.value]);
          } else {
            // toggle based on current state, add or remove
            if (dept.includes(other.value)) {
              setDept(dept.filter((d) => d !== other.value));
            } else {
              setDept([...dept, other.value]);
            }
          }
        }}
      >
        {other.label}
        <Badge color={getDeptColor(other.value)} ml={8} variant="light">
          {other.value.toUpperCase()}
        </Badge>
      </Menu.Item>
    ));

    return (
      <Menu closeDelay={99} openDelay={100} trigger="click-hover">
        <Menu.Target>
          <Button
            leftSection={<IconBuilding size={15} />}
            rightSection={<IconChevronDown size={15} />}
            variant="default"
          >
            Departments
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>College Departments</Menu.Label>
          {deptItems}

          <Menu.Divider />

          <Menu.Label>Offices</Menu.Label>
          {officeItems}

          <Menu.Divider />

          <Menu.Label>Others</Menu.Label>
          {otherItems}
        </Menu.Dropdown>
      </Menu>
    );
  },
);
FilterDepartments.displayName = 'FilterDepartments';

/**
 * Menu items to filter by user positions (head, dean);
 * does not include student roles
 */
export const FilterPositions = memo(
  ({ pos, setPos, single }: FilterPosProps) => {
    const posItems = listPos.map((userPos) => (
      <Menu.Item
        key={userPos.value}
        leftSection={pos.includes(userPos.value) && <IconCheck size={16} />}
        onClick={() => {
          if (single) {
            if (pos.includes(userPos.value)) {
              setPos(pos.filter((p) => p !== userPos.value));
            } else {
              setPos([userPos.value]);
            }
          } else if (pos.includes(userPos.value)) {
            setPos(pos.filter((p) => p !== userPos.value));
          } else {
            setPos([...pos, userPos.value]);
          }
        }}
      >
        {userPos.label}

        <Badge color={getPosColor(userPos.value)} ml={8} variant="dot">
          {userPos.value.toUpperCase()}
        </Badge>
      </Menu.Item>
    ));

    return (
      <Menu trigger="click-hover">
        <Menu.Target>
          <Button
            leftSection={<IconUserStar size={15} />}
            rightSection={<IconChevronDown size={15} />}
            variant="default"
          >
            Positions
          </Button>
        </Menu.Target>

        <Menu.Dropdown>{posItems}</Menu.Dropdown>
      </Menu>
    );
  },
);
FilterPositions.displayName = 'FilterPositions';

/**
 * Menu items to filter by user's role
 */
export const FilterUserRoles = memo(
  ({ roles, setRoles, single }: FilterUserRolesProps) => {
    const rolesItems = listUserRoles.map((role) => (
      <Menu.Item
        key={role.value}
        leftSection={roles.includes(role.value) && <IconCheck size={16} />}
        onClick={() => {
          if (single) {
            setRoles([role.value]);
          } else {
            // toggle based on current state, add or remove
            if (roles.includes(role.value)) {
              setRoles(roles.filter((r) => r !== role.value));
            } else {
              setRoles([...roles, role.value]);
            }
          }
        }}
      >
        {role.label}
        <Badge color={getRoleColor(role.value)} ml={8} variant="outline">
          {role.value.toUpperCase()}
        </Badge>
      </Menu.Item>
    ));

    return (
      <Menu closeDelay={99} openDelay={100} trigger="click-hover">
        <Menu.Target>
          <Button
            leftSection={<IconUserStar size={15} />}
            rightSection={<IconChevronDown size={15} />}
            variant="default"
          >
            Roles
          </Button>
        </Menu.Target>

        <Menu.Dropdown>{rolesItems}</Menu.Dropdown>
      </Menu>
    );
  },
);
FilterUserRoles.displayName = 'FilterUserRoles';

/**
 * Complete filter controls for users.
 *
 * @param dept - list of selected departments
 * @param setDept - set list of selected departments
 * @param pos - list of selected positions
 * @param setPos - set list of selected positions
 */
export const FilterUsers = memo((filters: UsersFiltersProps) => {
  return (
    <>
      {/* Table Filters */}
      <Button.Group>
        <FilterDepartments
          dept={filters.dept}
          setDept={filters.setDept}
          single={filters.single}
        />
        <FilterUserRoles
          roles={filters.roles}
          setRoles={filters.setRoles}
          single={filters.single}
        />
        <FilterPositions
          pos={filters.pos}
          setPos={filters.setPos}
          single={filters.single}
        />
      </Button.Group>
    </>
  );
});
FilterUsers.displayName = 'FilterUsers';
