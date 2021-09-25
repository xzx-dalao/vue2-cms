<template>
  <div>
    <!-- 表单 -->
    <el-form
      label-width="0px"
      class="login_form"
      :model="loginform"
      :rules="loginrules"
      ref="loginref"
    >
      <!-- 用户名 -->
      <el-form-item prop="username">
        <el-input
          v-model="loginform.username"
          placeholder="用户名或者电子邮箱"
          prefix-icon="el-icon-user"
        ></el-input>
      </el-form-item>

      <!-- 密码 -->
      <el-form-item prop="passward">
        <el-input
          placeholder="密码"
          v-model="loginform.password"
          show-password
          maxlength="16"
          minlength="3"
          prefix-icon="el-icon-lock"
        >
        </el-input>
      </el-form-item>

      <!--按钮 -->
      <el-form-item class="btns">
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetloginform">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      loginform: { username: "admin", password: "123456" },
      //校验规则
      loginrules: {
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          {
            min: 3,
            max: 16,
            message: "长度在 3 到 16 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  components: {},
  //生命周期 - 创建完成（访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {},
  methods: {
    resetloginform() {
      this.$refs.loginref.resetFields();
      this.loginform.password = ""; //密码不重置
    },
    login() {
      if (this.loginform.password !== "") {
        this.$refs.loginref.validate((val) => {
          if (!val) return;
          this.$http.post("login", this.loginform).then((res) => {
            if (res.data.meta.status !== 200)
              return this.$message.warning("登陆失败");
            this.$message.success("登陆成功");
            // console.log(res);
            //设置token
            window.sessionStorage.setItem("token", res.data.data.token);
            this.$router.push("/home");
          });
        });
      } else {
        this.$message.error("密码为空");
      }
    },
  },
};
</script>
<style lang="less" scoped>
/* @import url(); 引入css类 */
.login_form {
  width: 500px;
  height: 180px;
  background-color: rgb(250, 250, 250);
  position: absolute;
  left: 50%;
  top: 50%;
  padding: 0 20px;
  transform: translate(-50%, -50%);
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>