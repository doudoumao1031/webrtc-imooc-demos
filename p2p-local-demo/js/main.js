'use strict'

const localVideo = document.querySelector('video#localvideo')
const remoteVideo = document.querySelector('video#remotevideo')

const btnStart = document.querySelector('button#start')
const btnCall = document.querySelector('button#call')
const btnHangup = document.querySelector('button#hangup')

const offer = document.querySelector('textarea#offer')
const answer = document.querySelector('textarea#answer')

// console.log(remoteVideo)

let localStream
let pc1, pc2

function getMediaStream(stream) {
    // console.log('getMediaStream', stream)
    localVideo.srcObject = stream
    localStream = stream
    // remoteVideo.srcObject = stream
}

function handleError(e) {
    console.error('get MediaStream failed')
}

function start(params) {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
        console.error('MediaAPI not supported')
        return
    }else{
        const constraints = {
            video: true,
            audio: false
        }
        console.log('start')
        navigator.mediaDevices.getUserMedia(constraints)
            .then(getMediaStream)
            .catch(handleError)
    }
}

// 以下是p2p原因逻辑
function getRemoteStream(e) {
    remoteVideo.srcObject = e.streams[0]
    // remoteVideo.srcObject = localStream
    remoteVideo.play()
    // console.log(localStream, e.streams[0], localStream==e.streams[0])
    console.log(localStream.getTracks(), e.streams[0].getTracks(), localStream==e.streams[0])
    console.log(localStream.getTracks(), e.streams[0].getTracks(), localStream==e.streams[0])
}

function handleOfferError(err){
    console.error('create offer failed')
}

function getOffer(desc) {
    pc1.setLocalDescription(desc)
    offer.value = desc.sdp

    // send desc to signal server
    // revceive desc from signal server

    pc2.setRemoteDescription(desc)
    pc2.createAnswer()
        .then(getAnswer)
        .catch(handleAnswerError)
}

function handleAnswerError(err){
    console.error('create Answer failed')
}

function getAnswer(desc) {
    pc2.setLocalDescription(desc)
    answer.value = desc.sdp

    // send desc to signal server
    // receive desc from signal server

    pc1.setRemoteDescription(desc)
}

function call(){
    pc1 = new RTCPeerConnection({
        bundlePolicy: 'max-compat',
        iceTransportPolicy: 'all',
        rtcpMuxPolicy: 'negotiate'
    })
    pc2 = new RTCPeerConnection({
        bundlePolicy: 'max-compat',
        iceTransportPolicy: 'all',
        rtcpMuxPolicy: 'negotiate'
    })
    pc1.onicecandidate = (e) => {
        pc2.addIceCandidate(e.candidate)
    }
    pc2.onicecandidate = (e) => {
        pc1.addIceCandidate(e.candidate)
    }
    pc2.ontrack = getRemoteStream // 这儿是换desc 换candidate 后 链路就通了 自动推流自动触发的？！

    // 先加流再媒体协商
    localStream.getTracks().forEach(track => {
        pc1.addTrack(track, localStream)
    })

    const offerOptions = {
        offerToRecieveAudio: 0,
        offerToRecieveVideo:1
    }
    pc1.createOffer(offerOptions)
        .then(getOffer)
        .catch(handleOfferError)
}

function hangup() {
    pc1.close()
    pc2.close()
    pc1 = null
    pc2 = null
}

// btnStart.onClick = start
// btnCall.onClick = call
// btnHangup.onClick = hangup
btnStart.addEventListener('click', start)
btnCall.addEventListener('click', call)
btnHangup.addEventListener('click', hangup)

// ios不渲染问题
remoteVideo.addEventListener('loadeddata', (params) => {
    console.log('loadeddata')
})
remoteVideo.addEventListener('canplay', (params) => {
    console.log('canplay')
})  
remoteVideo.addEventListener('waiting', (params) => {
    console.log('waiting', params)
})
remoteVideo.addEventListener('suspend', (params) => {
    console.log('suspend')
})
remoteVideo.addEventListener('stalled', (params) => {
    console.log('stalled')
})
remoteVideo.addEventListener('progress', (params) => {
    console.log('progress', params)
})
remoteVideo.addEventListener('emptied', (params) => {
    console.log('emptied', params)
})
remoteVideo.addEventListener('loadstart', (params) => {
    console.log('loadstart', params)
})
remoteVideo.addEventListener('abort', (params) => {
    console.log('abort', params)
})