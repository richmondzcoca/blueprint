<template>
  <div class="home">
    <div style="position:absolute;right:5px;bottom:0">
      <small> version: {{appVersion}} </small>
    </div>
    <img alt="Blueprint logo" src="../../public/blueprint.png" style="width: 200px;">
    <div v-if="isInvalid && attendanceData.status != 'Break'">
      <textarea v-model="reason" cols="30" rows="3"></textarea>
    </div>
    <div style="font-size: 60px;
    font-weight: bold;">
      {{ timeStartedText.hours }}:{{ timeStartedText.minutes }}:{{ timeStartedText.seconds }}
    </div>
    <div>Status: <span :style="[attendanceData.status == 'Active' ? {color:'green'} : {color: 'red'}]"> {{attendanceData.status}} </span></div>
    <div class="mt-3">
      <button class="btn btn-secondary" @click="modal">Logout</button>
      <button class="btn ms-2" :class="[attendanceData.status == 'Break' ? 'btn-success' : 'btn-secondary']" @click="modal"> {{ attendanceData.status == 'Break' ? 'Break-in' : 'Break' }} </button>
    </div>
    <div class="invalid-feedback" :style="[isInvalid ? {'display': 'block'} : {'display': 'none'}]">
        {{ errorText }}
    </div>
    <div class="bp-modal hidden">
      <div class="bp-modal-container">
        <span @click="close" class="close">&times;</span>
        <div class="bp-modal-body">
          <p> {{modalMessage}}, please confirm, thank you.</p>
        </div>
        <div class="bp-modal-buttons">
          <img v-if="yesSpinner" src="../assets/svg/spinner.svg" alt="spinner" style="width:50px">
          <button @click="yes" class="btn btn-primary">Yes</button>
          <button @click="close" class="btn btn-secondary ms-2">No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { ipcRenderer } from 'electron'
import { ref } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { version } from '../../package.json';

export default {
  name: 'Home',
  components: {
    // HelloWorld
  },
  setup(){

    const store = useStore()

    const appVersion = ref(version)
    const modalMessage = ref('')
    const errorText  = ref('')
    const isInvalid = ref(false)
    const reason = ref('')
    const timeStartedText = ref({
      hours: '00',
      minutes: '00',
      seconds: '00'
    })
    const yesSpinner = ref(false)
    const modalButtonText = ref('')

    ipcRenderer.on('reply-notification',(event, args) =>{
      console.log(args);
    })

    const timeDiffCalc = (timeStarted) => {
      // timeStarted = new Date("May 21, 2021 03:50:00 AM")
      timeStarted = new Date(timeStarted)
      const $dateNow = Date.now()
      let diffInSeconds = Math.abs(timeStarted - $dateNow) / 1000;
      let time = {}

      const twoDigitNumber = (number) => {
        return number.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false
        })
      }

      // calculate days
      const days = Math.floor(diffInSeconds / 86400);
      diffInSeconds -= days * 86400;
      time.days = twoDigitNumber(days)

      // calculate hours
      const hours = Math.floor(diffInSeconds / 3600) % 24;
      diffInSeconds -= hours * 3600;
      time.hours = twoDigitNumber(hours)

      // calculate minutes
      const minutes = Math.floor(diffInSeconds / 60) % 60;
      diffInSeconds -= minutes * 60;
      time.minutes = twoDigitNumber(minutes)

      const seconds = Math.floor(diffInSeconds);
      time.seconds = twoDigitNumber(seconds);

      return time;
    }

    const attendanceData = ref(JSON.parse(localStorage.getItem('attendanceData')))
    store.state.userStatus = attendanceData.value.status
    modalButtonText.value = attendanceData.value.status

    const $date = attendanceData.value.timeStarted

    const $timeout = () => {
      setTimeout(() => {
        timeStartedText.value = timeDiffCalc($date)
        $timeout()
      }, 1000);
    }

    $timeout();

    const modal = (e) => {

      modalButtonText.value = e.currentTarget.textContent
      document.querySelector('.bp-modal').classList.remove('hidden')

      switch(modalButtonText.value){
        case 'Logout':
          modalMessage.value = 'Logout'
        break;
        case 'Break':
          modalMessage.value = 'Break-out'
        break;
        case 'Break-in':
          modalMessage.value = 'Break-in'
        break;
      }
    }

    const close = () => {
      yesSpinner.value = false
      document.querySelector('.bp-modal').classList.add('hidden')
    }

    const yes = () => {
      yesSpinner.value = true

      switch(modalButtonText.value){
        case 'Logout':
          modalMessage.value = 'Logout'
          if(isInvalid.value && reason.value == ''){
            return errorText.value = "Reason is required"
          }
          axios.post('/api/attendance-logout',{
              localIpAddress: store.state.localIpAddress,
              reason: reason.value,
            })
          .then(() => {
            yesSpinner.value = false
            localStorage.removeItem('token')
            window.location.href = '#/login'
            localStorage.removeItem('attendanceData')
            ipcRenderer.send('show-notification',{
              'title' : 'Jayvee',
              'body' : ' Logout'
            })
          })
          .catch((error) => {
            yesSpinner.value = false
            if(error.response.status == 500){
              isInvalid.value = true
              errorText.value = error.response.data
            }
            localStorage.removeItem('token')
            window.location.href = '#/login'
            localStorage.removeItem('attendanceData')
          })
        break;

        case 'Break':
          modalMessage.value = 'Break-out'
          axios.post('/api/attendance-break',{status:'break'})
            .then(({data}) => {
              attendanceData.value.status = data.status
              localStorage.setItem('attendanceData',JSON.stringify(attendanceData.value))
              close()
              ipcRenderer.send('show-notification',{
                'title' : 'Jayvee',
                'body': 'Break-out',
              })
            })
            .catch((error) => {
              if(error.response.status == 500){
                store.state.userStatus = error.response.data
              }
              close()
            })
        break;

        case 'Break-in':
          modalMessage.value = 'Break-in'
          axios.post('/api/attendance-break',{status:'breakIn'})
            .then(({data}) => {
              attendanceData.value.status = data.status
              localStorage.setItem('attendanceData',JSON.stringify(attendanceData.value))
              close()
              ipcRenderer.send('show-notification',{
                'title' : 'Jayvee',
                'body' : 'Break-in',
              })
            })
            .catch((error) => {
              if(error.response.status == 500){
                store.state.userStatus = error.response.data
              }
              close()
            })
        break;
      }
    }

    return {
      appVersion,
      modalMessage,
      attendanceData,
      store,
      modalButtonText,
      yesSpinner,
      timeStartedText,
      errorText,
      isInvalid,
      reason,
      modal,
      yes,
      close,
    }
  }
}
</script>
<style scoped>
  .home{
    width: 100%;
  }
  li{
    list-style: none;
  }
  .bp-modal{
    position: fixed;
    background: #000000a1;
    height: 100%;
    width: 100%;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .bp-modal-container{
    height: 150px;
    width: 30%;
    background: white;
    position: relative;
  }
  .close{
    font-size: 30px;
    position: absolute;
    top: -8px;
    right: 4px;
    cursor: pointer;
  }
  .close:hover{
    opacity: 0.8;
  }
  .bp-modal-buttons{
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 10px;
    display: flex;
    justify-content: space-around;
    height: 60px;
  }
  .bp-modal-body{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  .hidden{
    display: none;
  }
  @media only screen and (max-width: 600px) {
    .bp-modal-container {
      width: 90% !important;
      /* height: 30% !important; */
    }
  }
</style>