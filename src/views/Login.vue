<template>
    <form class="container-md" @submit.prevent="login" style="max-width: 500px;">
        <h1>Login</h1>
        <div class="form-floating mb-3">
            <input v-model="user.name" type="text" class="form-control" :class="{'is-invalid':isInvalid,'is-valid':isValid}" id="username" placeholder="Username" name="username">
            <label for="username">Username</label>
        </div>
        <div class="form-floating">
            <input v-model="user.password" type="password" class="form-control" :class="{'is-invalid':isInvalid,'is-valid':isValid}" id="password" placeholder="Password" name="password">
            <label for="password">Password</label>
        </div>
        <div class="invalid-feedback" :style="[isInvalid ? {'display': 'block'} : {'display': 'none'}]">
            {{ errorText }}
        </div>
        <div class="valid-feedback" :style="[isValidFeedback ? {'display': 'block'} : {'display': 'none'}]">
            {{ validText }}
        </div>
        <div>

        </div>
        <div class="mt-3">
            <img v-if="spinner" src="../assets/svg/spinner.svg" alt="spinner" style="width:50px">
            <button class="btn btn-primary" type="submit">Submit</button>
            <button @click="requestForLogin" v-if="isLogOut" class="btn btn-danger ms-2" type="button">Request for Login</button>
        </div>
    </form>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'

export default {
    name: 'Login',
    setup(){

        const store = useStore()

        const errorText = ref('')
        const validText = ref('')

        const isLogOut = ref(false);
        const spinner = ref(false);

        const user = ref({
            name: '',
            password: '',
            localIpAddress: '',
        })

        const isInvalid = ref(false)
        const isValid = ref(false)
        const isValidFeedback = ref(false)

        const login = () => {
            user.value.localIpAddress = store.state.localIpAddress;
            spinner.value = true;
            axios.post('api/attendance-login',user.value)
                .then(({data}) => {
                    isValid.value = true
                    isInvalid.value = false
                    store.state.isAuthenticated = true
                    window.location.href = '#/'
                    localStorage.setItem('token',data.access_token)
                    localStorage.setItem('attendanceData',JSON.stringify(data))
                    spinner.value = false;
                })
                .catch((error) => {
                    errorText.value = error.response.data.error
                    isInvalid.value = true
                    isLogOut.value = error.response.data.isLogOut
                    isValidFeedback.value = false;
                    spinner.value = false;
                });
        }

        const requestForLogin = () => {
            spinner.value = true;
            axios.post('api/request-for-login',user.value)
                .then(({data}) => {
                    isValidFeedback.value = true
                    isInvalid.value = false
                    validText.value = data.response
                    isLogOut.value = false
                    spinner.value = false;
                })
                .catch((error) => {
                    isValidFeedback.value = false
                    errorText.value = error.response.data.error
                    isInvalid.value = true
                    spinner.value = false;
                });
        }

        return {
            spinner,
            validText,
            isValidFeedback,
            requestForLogin,
            isValid,
            isInvalid,
            login,
            user,
            errorText,
            isLogOut,
        }
    }
}
</script>

<style>

</style>