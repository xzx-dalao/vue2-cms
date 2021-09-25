<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="AddRoleDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 添加角色面板 -->
      <el-dialog
        title="添加角色"
        :visible.sync="AddRoleDialogVisible"
        width="40%"
        @close="addRoleDialogClosed"
      >
        <el-form
          :model="addRoleForm"
          ref="addRoleFormRef"
          :rules="addRoleFormRules"
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="AddRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑角色面板 -->
      <el-dialog
        title="编辑角色"
        :visible.sync="editRoleDialogVisible"
        width="40%"
        @close="editRoleClosed"
      >
        <el-form
          :model="editRoleForm"
          ref="editRoleFormRef"
          :rules="editRoleFormRules"
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoles">确 定</el-button>
        </span>
      </el-dialog>
      <el-table :data="roleList" border stripe>
        <el-table-column label="#" type="expand">
          <template v-slot="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 1级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 2级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 3级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
                 {{scope.row}}
               </pre> -->
          </template>
        </el-table-column>
        <el-table-column label="Id" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="roleDesc" widch="auto">
          <template v-slot="scope">
            <el-tooltip
              effect="dark"
              content="编辑"
              placement="top"
              :enterable="false"
            >
              <el-button
                icon="el-icon-edit"
                size="mini"
                type="primary"
                @click="editRoleDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              effect="dark"
              content="删除"
              placement="top"
              :enterable="false"
            >
              <el-button
                icon="el-icon-delete"
                size="mini"
                type="delete"
                @click="deleteRoleDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              effect="dark"
              content="分配权限"
              placement="top"
              :enterable="false"
            >
              <el-button
                icon="el-icon-setting"
                size="mini"
                type="warning"
                @click="showSetRightDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        ref="treeref"
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <pre>
      {{ roleList }}
    </pre>
  </div>
</template>

<script>
export default {
  name: "role",
  data() {
    return {
      roleList: [],
      AddRoleDialogVisible: false,
      // 添加角色表单
      addRoleForm: {},
      //   添加角色表单验证
      addRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      editRoleForm: {},
      editRoleDialogVisible: false,
      editRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      setRightDialogVisible: false,
      rightslist: [],
      //默认勾选节点
      defKeys: [],
      //树绑定的属性
      treeProps: {
        children: "children",
        label: "authName",
      },
      //   当前即将分配权限的Id
      roleId: "",
    };
  },
  components: {},
  //生命周期 - 创建完成（访问当前this实例）
  created() {
    this.getrolelist();
  },
  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {},
  methods: {
    getrolelist() {
      this.$http.get("roles").then((res) => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取角色列表失败");
        }

        this.roleList = res.data.data;
      });
    },
    removeRightById(role, rightId) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http
            .delete(`roles/${role.id}/rights/${rightId}`)
            .then((res) => {
              if (res.data.meta.status !== 200) {
                return this.$message.error("删除失败");
              }
              this.$message.success("删除用户权限成功");
              this.getrolelist();
            });
        })
        .catch((err) => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
          return err;
        });
    },
    //监听添加用户会话框
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields();
    },
    addRoles() {
      this.$refs.addRoleFormRef.validate((valid) => {
        if (!valid) return;
        this.$http.post("roles", this.addRoleForm).then((res) => {
          if (res.data.meta.status !== 201) {
            this.$message.error("添加角色失败！");
          }
          this.$message.success("添加角色成功！");
          this.AddRoleDialogVisible = false;
          this.getrolelist();
        });
      });
    },
    // 请求获取信息
    editRoleDialog(id) {
      this.$http.get(`roles/${id}`).then((res) => {
        if (res.data.meta.status !== 200)
          return this.$message.error("查询角色信息失败！");
        this.editRoleForm = res.data.data;
        this.editRoleDialogVisible = true;
      });
    },
    //重置
    editRoleClosed() {
      this.$refs.editRoleFormRef.resetFields();
    },
    //提交修改
    editRoles() {
      this.$refs.editRoleFormRef.validate((valid) => {
        if (!valid) return;

        this.$http
          .put("roles/" + this.editRoleForm.roleId, {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc,
          })
          .then((res) => {
            if (res.data.meta.status !== 200) {
              this.$message.error("更新角色信息失败");
            }
            // 隐藏编辑角色对话框
            this.editRoleDialogVisible = false;
            this.$message.success("更新角色信息成功");
            this.getrolelist();
          });
      });
    },
    deleteRoleDialog(id) {
      {
        this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then((res) => {
            this.$http.delete(`roles/${id}`).then((res) => {
              if (res.data.meta.status !== 200)
                return this.$message.error("删除角色失败");
              this.$message.success("删除用户成功");
              this.getrolelist();
            });
          })
          .catch((err) => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      }
    },
    showSetRightDialog(role) {
      this.roleId = role.id;
      this.$http.get("rights/tree").then((res) => {
        if (res.data.meta.status !== 200)
          return this.$message.error("获取权限数据失败");
        this.rightslist = res.data.data;
        // console.log(this.rightslist)
        //递归获取三级节点的id
        this.getleafkeys(role, this.defKeys);
        this.setRightDialogVisible = true;
      });
    },
    getleafkeys(node, arr) {
      // 没有children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getleafkeys(item, arr));
    },
    // 权限对话框关闭事件
    setRightDialogClosed() {
      this.defKeys = [];
    },
    //分配权限
    allotRights() {
      const keys = [
        ...this.$refs.treeref.getCheckedKeys(),
        ...this.$refs.treeref.getHalfCheckedKeys(),
      ];
      // join() 方法用于把数组中的所有元素放入一个字符串
      const idStr = keys.join(",");
      this.$http
        .post(`roles/${this.roleId}/rights`, { rids: idStr })
        .then((res) => {
          if (res.data.meta.status !== 200)
            return this.$message.error("分配权限失败");
          this.$message.success("分配权限信息成功");
          this.getrolelist();
          this.setRightDialogVisible = false;
        });
    },
  },
};
</script>
<style scoped>
/* @import url(); 引入css类 */
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-top: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>