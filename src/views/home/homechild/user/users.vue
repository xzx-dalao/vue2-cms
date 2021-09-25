<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索添加区 -->
      <el-row :gutter="20">
          <el-col :span="8">
             <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getuserlistbug"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
           <el-button type="primary" @click="addDialogVisible = true" >添加用户</el-button>
        </el-col>
      </el-row>
      <!-- table展示区 -->
      <el-table :data="userList" :border="true" stripe>
        <el-table-column label="Id" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
              </el-tooltip>
             <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
                </el-tooltip>
             <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose">
     <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
       <el-form-item label="用户名" prop="username">
         <el-input v-model="addForm.username"></el-input>
       </el-form-item>
       <el-form-item label="密码" prop="password" show-password>
         <el-input v-model="addForm.password"></el-input>
       </el-form-item>
       <el-form-item label="邮箱" prop="email">
         <el-input v-model="addForm.email"></el-input>
       </el-form-item>
       <el-form-item label="手机" prop="mobile">
         <el-input v-model="addForm.mobile" maxlength="11"></el-input>
       </el-form-item>
     </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
  <el-dialog
    title="修改用户"
    :visible.sync="editDialogVisible"
    width="50%"
    @close="editDialogClose">
    <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
      <el-form-item label="用户名">
        <el-input v-model="editForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="editForm.mobile" maxlength="11"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editUser(editForm.id)">确 定</el-button>
    </span>
  </el-dialog>
  <!-- 分配角色对话框 -->
  <el-dialog
    title="分配角色"
    :visible.sync="setRoleDialogVisible"
    width="50%"
    @close="setRoleDialogClose()">
    <div>
      <p>当前用户：{{userInfo.username}}</p>
      <p>当前角色：{{userInfo.role_name}}</p>
      <p>分配新角色：
      <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </p>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="setRoleDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="saveRoleInfo()">确 定</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
      if (regEmail.test(value)) { return callback() }
      callback(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) { return callback() }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        eamil: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 4, max: 15, message: '长度在 4 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      setRoleDialogVisible: false,
      userInfo: {},
      rolesList: [],
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
      getuserlistbug() {
      this.queryInfo.pagenum = 1;
      this.getUserList();
    },
  getUserList () {
        this.$http.get("users", { params: this.queryInfo }).then((res) => {
           console.log(res)
        if (res.data.meta.status !== 200)
          return this.$message.error(res.data.meta.msg);
        this.userList = res.data.data.users
      this.total = res.data.data.total
      });
    },
    handleSizeChange (newSize) {
       //监听pagesize
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
       //监听页码值
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //监听switch开关
   userStateChanged (userInfo) {
      this.$http
        .put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        .then((res) => {
          if (res.data.meta.status !== 200) {
               userInfo.mg_state = !userInfo.mg_state
            return this.$message.error("用户状态更新失败");
          }
          this.$message.success("用户状态更新成功");
        });
    },
     //监听添加用户会话框
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
     //添加功能
    addUser () {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return ;
        this.$http.post('users', this.addForm).then((res) => {
         if (res.data.meta.status !== 201) { return this.$message.error('添加用户失败！') }
        this.$message.success('添加用户成功！')
        this.addDialogVisible = false
        this.getUserList()
        })
      })
    },
    //修改功能
    // 获取用户信息
    showEditDialog (id) {
      this.$http.get(`users/${id}`).then((res) => {   
        if (res.data.meta.status !== 200) { return this.$message.error('用户查询失败！') }
      this.editForm = res.data.data
      this.editDialogVisible = true})
    },
    // 监听修改用户对话框的关闭事件
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
     // 提交请求前，表单预验证
    editUser (id) {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return;
      this.$http.put(`users/${id}`, { email: this.editForm.email, mobile: this.editForm.mobile }).then(res=>{
        if (res.data.meta.status !== 200) { return this.$message.error('更新用户失败！') }
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('修改用户成功！')})
        
      })
    },
    //删除功能
    deleteUser (id) {
           this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res => {
         this.$http.delete(`users/${id}`).then(res=>{
         if (res.data.meta.status !== 200) { return this.$message.error('删除失败') }
         this.editDialogVisible = false
         this.$message.success('删除用户成功！')
         this.getUserList()
        })
        }).catch(err => {
          this.$message.info('已取消删除')    
        });
    },

//分配角色功能
//获取角色信息
   setRole (userInfo) {
      this.userInfo = userInfo
     this.$http.get('roles').then(res=>{
 if (res.data.meta.status !== 200) { return this.$message.error('获取角色列表失败！') }
      this.rolesList = res.data.data
      this.setRoleDialogVisible = true
     })
    },
saveRoleInfo () {
      if (!this.selectedRoleId) { return this.$message.error('请选择要分配的角色') }
this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId }).then(res=>{
        if (res.data.meta.status !== 200) { return this.$message.error(res.meta.msg) }
      this.$message.success('更新用户成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
})

    },
    setRoleDialogClose () {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped="scoped">
  .el-table{
    margin-top: 15px;
    font-size: 12px;
  }
</style>
