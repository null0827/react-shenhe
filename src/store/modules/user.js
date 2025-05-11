import { createSlice } from "@reduxjs/toolkit";
import { request } from "@/utils";

const userStore = createSlice({
  name: "user",
  initialState: {
    token: localStorage.getItem("token_key") || "",
  },
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      //localstorage存储token实现token持久化
      localStorage.setItem("token_key", action.payload);
    },
  },
});

const { setToken } = userStore.actions;
const userReducer = userStore.reducer;

const fetchLogin = (loginForm) => {
  return async (dispatch) => {
    const res = await request.post("/authorizations", loginForm);

    dispatch(setToken(res.data.token));
  };
};

export { fetchLogin, setToken };
export default userReducer;
