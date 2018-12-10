const h = React.createElement

let data = ['1','2','3','4','5','6','7','8','9']
const imgSize = '60'

class Img extends React.Component {
  render(){
    return h(
      'div',
      {
        style: Object.assign({
          width: `${imgSize}px`,
          height: `${imgSize}px`,
          display: 'inline-block',
          lineHeight: `${imgSize}px`,
          textAlign: 'center',
          background: 'rgba(171, 173, 49, 0.7)',
        },this.props.style)
      },
      this.props.id
    )
  }
}

class App extends React.Component {
  constructor(...args){
    super(...args)
    this.state = {
      sliderLeftStart: 0,
      sliderLeftMax: 0,
      img9Top: 0,
      img9Left: 0,
      img9HoverIndex: null,
      fillData: data.map(()=>'0'),
      sliderMoveLock: false,
      moveImgX: 0,
      moveImgY: 0,
      pickId: null,
    }
    this.slider = React.createRef()
    this.img9 = React.createRef()
    this.sliderTemp = { last: { x:0, y:0 }, start: { x:0, y:0 } }
    this.img9Temp = { touchEndIndex: 0 }
  }
  componentDidMount(){
    this.setState({
      sliderLeftStart: (this.slider.current.clientWidth - data.length*imgSize)/2,
      sliderLeftMax: this.slider.current.clientWidth - data.length*imgSize,
      img9Top: this.img9.current.offsetTop,
      img9Left: this.img9.current.offsetLeft,
    })
  }
  /**@param {TouchEvent} e */
  onSliderTouchStart(e){
    const [ finger ] = e.touches
    this.sliderTemp.last = { x: finger.clientX, y: finger.clientY }
    this.sliderTemp.start = { x: finger.clientX, y: finger.clientY }
  }
  /**@param {TouchEvent} e */
  onSliderTouchMove(e){
    const [ finger ] = e.touches
    let val = finger.clientX - this.sliderTemp.last.x
    this.sliderTemp.last = { x: finger.clientX, y: finger.clientY }
    let moveLock = this.state.sliderMoveLock
    if(finger.clientY < this.slider.current.offsetTop){
      let pickIdIndex = Math.floor((finger.clientX - this.state.sliderLeftStart)/imgSize)
      let pickId = data[pickIdIndex]
      if(!moveLock && !this.state.fillData.includes(pickId)){
        this.setState({ pickId: pickId, })
      }
      moveLock = true
      if(this.state.pickId!==null || pickId){
        this.pickImg(e)
      }
    }else{
      moveLock = false
      this.setState({ pickId: null })
    }
    this.setState({ sliderMoveLock: moveLock })
    if(!moveLock){
      // console.log(val)
      this.setState((state)=>{
        let newVal = state.sliderLeftStart + val
        newVal = Math.max(newVal, this.state.sliderLeftMax)
        newVal = Math.min(newVal,0)
        return { sliderLeftStart: newVal }
      })
    }
  }
  /**@param {TouchEvent} e */
  onSliderTouchEnd(e){
    if(isNaN(this.state.pickId))return;
    if(this.state.pickId===null || this.state.pickId==='0')return;
    if(isNaN(this.state.img9HoverIndex))return;
    let fillData = this.state.fillData.map(v=>v)
    fillData[this.state.img9HoverIndex] = this.state.pickId
    this.setState({ fillData, },()=>this.checkIsFinished())
  }
  /**@param {TouchEvent} e */
  pickImg(e){
    const [ finger ] = e.touches
    let hoverIndex = this.getImg9HoverAreaIndex(e)
    this.setState({
      moveImgX: finger.clientX - imgSize/2,
      moveImgY: finger.clientY - imgSize/2,
      img9HoverIndex: hoverIndex
    })
  }
  /**@param {TouchEvent} e */
  onImg9TouchStart(e){
    let index = this.getImg9HoverAreaIndex(e)
    let pickId = this.state.fillData[index]
    if(pickId!=='0'){
      this.pickImg(e)
      this.setState({ pickId, sliderMoveLock: true })
    }
  }
  /**@param {TouchEvent} e */
  onImg9TouchMove(e){
    if(!this.state.pickId)return;
    this.pickImg(e)
    this.img9Temp.touchEndIndex = this.getImg9HoverAreaIndex(e)
  }
  checkIsFinished(){
    if(JSON.stringify(this.state.fillData) === JSON.stringify(data)){
      setTimeout(()=>{
        alert('完成拼图')
      }, 200)
    }
  }
  /**@param {TouchEvent} e */
  onImg9TouchEnd(e){
    if(!this.state.pickId)return;
    let touchStartId = this.state.pickId
    let fillData = this.state.fillData.map(v=>v)
    let touchEndIndex = this.img9Temp.touchEndIndex
    let touchStartIndex = fillData.indexOf(touchStartId)
    let touchEndId = fillData[touchEndIndex]
    fillData[touchStartIndex] = touchEndId
    fillData[touchEndIndex] = touchStartId
    this.setState({ fillData, },()=>this.checkIsFinished())
  }
  /**@param {TouchEvent} e */
  getImg9HoverAreaIndex(e){
    const [ finger ] = e.touches
    let arr = [ finger.clientX - this.state.img9Left, finger.clientY - this.state.img9Top ]
    arr = arr.map(v=>Math.floor(v/60)).filter(v=>v>=0 && v <= 2)
    if(arr.length<2){
      return
    }
    let [ x, y ] = arr
    return 3*y+x
  }
  getSlider(){
    return h(
      'div', 
      {
        ref: this.slider,
        style: {
          'height': `${imgSize}px`,
          'background': 'red',
          'position': 'absolute',
          'bottom': '0',
          'left': '0', 'right': '0',
          'overflow': 'hidden',
        },
        onTouchStart: e=>this.onSliderTouchStart(e),
        onTouchMove: e=>this.onSliderTouchMove(e),
        onTouchEnd: e=>this.onSliderTouchEnd(e),
      },
      h(
        'div',
        {
          style:{
            'whiteSpace': 'nowrap',
            'transform': `translateX(${this.state.sliderLeftStart}px)`
          }
        },
        data.map((id)=>{
          let style = { transition: '0.7s' }
          if(id===this.state.pickId || this.state.fillData.includes(id)){
            style['opacity'] = '0.7'
          }
          return h(Img,{ id: id, style })
        })
      )
    )
  }
  getImg9(){
    return h('div',{
      ref: this.img9,
      style: { overflow:'hidden', width: `${imgSize*3}px`, height: `${imgSize*3}px`, margin: `${(window.innerHeight - imgSize*4)/2}px auto`, },
      onTouchStart: e=>this.onImg9TouchStart(e),
      onTouchMove: e=>this.onImg9TouchMove(e),
      onTouchEnd: e=>this.onImg9TouchEnd(e),
    },h(
      'table',
      {
        style: {
          borderCollapse: 'collapse',
          position: 'relative', top: '-1px', left: '-1px'
        }
      },
      h('tbody',{},_.chunk(this.state.fillData,3).map((chunk,y)=>{
        return h('tr',{},chunk.map((id,x)=>{
          let style = { opacity: '0.6' }
          if(this.state.img9HoverIndex===3*y+x || id!=='0'){
            style.opacity = 1
          }
          let img = h(Img,{ style, id:id })
          return h('td',{ style:{ border: '1px solid rgba(196, 197, 110, 0.67)', padding: '0' } },img)
        }))
      }))
    ))
  }
  getPickedImg(){
    let isShow = this.state.sliderMoveLock && this.state.pickId
    let opacity = isShow ? 1 : 0
    if(this.state.img9HoverIndex){
      opacity = 0.7
    }
    return h(Img,{
      id: this.state.pickId,
      style: {
        position: 'absolute',
        zIndex: 99,
        top: this.state.moveImgY,
        left: this.state.moveImgX,
        visibility: isShow ? 'visible' : 'hidden',
        opacity,
      }
    })
  }
  stateClear(){
    this.setState({
      sliderMoveLock: false,
      pickId: null,
      img9HoverIndex: null,
    })
  }
  render(){
    let slider = this.getSlider()
    let img9 = this.getImg9()
    let pickedImg = this.getPickedImg()
    return h('div',{
      style: {
        position: 'relative',
        padding: '1px 0',
        height: window.innerHeight - 2,
        width: window.innerWidth,
        overflow: 'hidden',
      },
      onTouchEnd: ()=>this.stateClear()
    },[
      pickedImg,
      img9,
      slider,
    ])
  }
}

ReactDOM.render(
  h(App),
  document.getElementById('app')
)
