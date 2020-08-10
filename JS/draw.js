var $ = function (id) {
    return document.getElementById(id)
}
var penBtn = document.getElementsByTagName('sl-button')[0]
var lineBtn = document.getElementsByTagName('sl-button')[1]
var dottedBtn = document.getElementsByTagName('sl-button')[2]
var rectBtn = document.getElementsByTagName('sl-button')[3]
var circleBtn = document.getElementsByTagName('sl-button')[4]
var triangleBtn = document.getElementsByTagName('sl-button')[5]
var ellipseBtn = document.getElementsByTagName('sl-button')[6]
var rightTriBtn = document.getElementsByTagName('sl-button')[7]
var textBtn = document.getElementsByTagName('sl-button')[8]
var editBtn = document.getElementsByTagName('sl-button')[9]
var confirmBtn = document.getElementsByTagName('sl-button')[10]
var deleteBtn = document.getElementsByTagName('sl-button')[11]
var colorPicker = document.getElementsByTagName('sl-color-picker')[0]
var fillColorPicker = document.getElementsByTagName('sl-color-picker')[1]
var strokeWidth = document.getElementsByTagName('sl-range')[0]
var modeSelect = document.getElementsByTagName('sl-select')[0]
var clearBtn = document.getElementsByTagName('sl-button')[13]

var canvas = new fabric.Canvas('canvas')
var upperCanvas = document.getElementsByClassName('upper-canvas')[0]

var mouseFromX, mouseFromY
var mouseToX, mouseToY
var imgId = 0
var imgArr = []
canvas.setWidth(1000)
canvas.setHeight(735)
canvas.selection = false
//图片宽度高度
var drawType = ''
function init() {
    mouseFromX = undefined
    mouseFromY = undefined   //初始化起点，防止重新点击的时候 起点已定义
    canvas.isDrawingMode = false
    textDrawing = false  //添加文字操作，不需要重复点击添加
    upperCanvas.className = 'upper-canvas'
    upperCanvas.classList.add('linepen')
}
function btnClick() {
    penBtn.onclick = function () {
        // console.log(this.type)
        penBtn.setFocus();
        init()
        upperCanvas.className = 'upper-canvas'
        upperCanvas.classList.add('pen')
        drawType = 'drawPen'
        canvas.isDrawingMode = true
        canvas.freeDrawingBrush.color = colorPicker.value;
        canvas.freeDrawingBrush.width = strokeWidth.value
        drawEvent();
    }
    lineBtn.onclick = function () {
        init();
        drawType = 'drawLine'
        drawEvent(); //获取坐标
    }
    dottedBtn.onclick = function () {
        init();
        drawType = 'drawDotted'
        drawEvent();
    }
    rectBtn.onclick = function () {
        init();
        window.drawType = 'drawRect'
        drawEvent();
    }
    circleBtn.onclick = function () {
        init();
        drawType = 'drawCircle'
        drawEvent();
    }
    triangleBtn.onclick = function () {
        init();
        drawType = 'drawTriangle'
        drawEvent();
    }
    ellipseBtn.onclick = function () {
        init();
        drawType = 'drawEllipse'
        drawEvent();
    }
    rightTriBtn.onclick = function () {
        init();
        drawType = 'drawRightTri'
        drawEvent();
    }
    textBtn.onclick = function () {
        canvas.isDrawingMode = false
        drawType = 'drawText'
        upperCanvas.className = 'upper-canvas'
        addText(drawType)

        //只有再次点击时drawing 才会等于 true
    }
    confirmBtn.onclick = function () {
        canvas.isDrawingMode = false
    }
    editBtn.onclick = () => canvas.isDrawingMode = false
    clearBtn.onclick = () => {
        canvas.clear(); $('preImg').src = null
    }
    modeSelect.addEventListener('slChange', function () {
        canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
        canvas.freeDrawingBrush.color = colorPicker.value;
        canvas.freeDrawingBrush.width = strokeWidth.value
    })
    $('upImg').onchange = function (e) {
        //获取图片
        var fileList = $('upImg').files
        var file = fileList[0]
        //读取图片
        var fileReader = new FileReader()
        fileReader.readAsDataURL(file) //读取图片
        fileReader.addEventListener('load', function () {
            // 读取完成
            let res = fileReader.result
            // res是base64格式的图片
            //生成图片
            var img = document.createElement('img')
            img.classList = 'localImg'
            img.setAttribute('id', `myimg${imgId}`)
            img.setAttribute('src', res)
            // $(`myImg${imgId}`).src = res
            //插入图片
            $('imgContainer').appendChild(img)

            $('preImg').src = res
            drawType = 'imgEdit'
            init()
            add()
            // 解决同一类型文件无法重复上传
            e.target.value = ''
        })

    }
    colorPicker.addEventListener('slAfterHide', function (e) {
        canvas.freeDrawingBrush.color = e.target.value;
    })
    strokeWidth.addEventListener('slChange', function (e) {
        canvas.freeDrawingBrush.width = e.target.value;
    })
}

btnClick();
function drawEvent() {
    drawing = false
    canvas.on('mouse:down', function (options) {
        mouseFromX = options.e.offsetX
        mouseFromY = options.e.offsetY
        if (drawType !== 'drawText') {
            drawing = true
        } //鼠标点击，继续画线
        // if (drawType === 'drawText' && !drawing) {
        //     console.log('haha')
        //     add()
        //     drawing = false  //绘制文本
        // }
    })
    canvas.on('mouse:move', function (options) {
        if (drawType !== 'drawText' && drawing) {
            mouseToX = options.e.offsetX
            mouseToY = options.e.offsetY
            add()  //增加图线
            // 上档键 绘制水平线
            if (drawType === 'drawLine' && options.e.shiftKey) {
                add('level')
            }
            if (drawType === 'drawLine' && options.e.ctrlKey) {
                add('upright')
            }
        }
    })
    canvas.on('mouse:up', function (options) {
        mouseToX = options.e.offsetX
        mouseToY = options.e.offsetY
        //鼠标抬起，结束画线
        drawing = false
        if (drawType != 'drawLine') {
            drawType = ''
        }//除了画直线，其他的不可以重复画
        lockdraw = null  //初始化lockdraw 保留上次的轨迹
    })
}
function selectEvent() {
    // if (drawType === 'drawLine') {
    //     this.set({
    //         lockMovementX: true,
    //         lockMovementY: true,
    //         // selectable: false,
    //         hasControls: false
    //     })
    // }
    canvas.on('selection:created', (e) => {
        // console.log(e)
        //删除
        deleteBtn.onclick = function () {
            if (canvas._activeObject) {
                canvas.remove(canvas._activeObject)
                drawType = ''
                canvas.renderAll()
            }
        }
        // 编辑
        editBtn.onclick = function () {
            if (canvas._activeObject) {
                canvas._activeObject.set({
                    lockMovementX: false,
                    lockMovementY: false,
                    hasControls: true,
                    selectable: true,
                })
            }
            drawType = ''
            canvas.isDrawingMode = false
        }
        //确定
        confirmBtn.onclick = function () {
            console.log(canvas._activeObject)
            if (canvas._activeObject) {
                if (canvas._activeObject.cacheKey) {
                    canvas._activeObject.set({
                        selectable: false,
                    })
                } else {
                    canvas._activeObject.set({
                        lockMovementX: true,
                        lockMovementY: true,
                        // selectable: false,
                        hasControls: false
                    })
                }

            }
        }
        // 填充颜色
        fillColorPicker.addEventListener('slChange', function () {
            if (!e.target.textLines && canvas._activeObject) {
                canvas._activeObject.set({
                    fill: fillColorPicker.value
                })
                canvas.renderAll()
            }
        })
        // 颜色、线宽改变
        colorPicker.addEventListener('slChange', function () {
            if (!e.target.textLines && canvas._activeObject) {
                canvas._activeObject.set({
                    stroke: colorPicker.value
                })
                canvas.renderAll()
            }
        })
        strokeWidth.addEventListener('slChange', function () {
            if (!e.target.textLines && canvas._activeObject) {
                canvas._activeObject.set({
                    strokeWidth: strokeWidth.value
                })
                canvas.renderAll()
            }
        })
        //阴影改变
        $('hShadow').addEventListener('slChange', function () {
            if (canvas._activeObject) {
                canvas._activeObject.set({
                    shadow: `${$('hShadow').value} ${$('vShadow').value} ${$('SBlur').value} ${$('shadowColor').value}`
                })
            }
            canvas.renderAll()
        })
        $('vShadow').addEventListener('slChange', function () {
            if (canvas._activeObject) {
                canvas._activeObject.set({
                    shadow: `${$('hShadow').value} ${$('vShadow').value} ${$('SBlur').value} ${$('shadowColor').value}`
                })
            }
            canvas.renderAll()
        })
        $('SBlur').addEventListener('slChange', function () {
            if (canvas._activeObject) {
                canvas._activeObject.set({
                    shadow: `${$('hShadow').value} ${$('vShadow').value} ${$('SBlur').value} ${$('shadowColor').value}`
                })
            }
            canvas.renderAll()
        })
        $('shadowColor').addEventListener('slChange', function () {
            if (canvas._activeObject) {
                canvas._activeObject.set({
                    shadow: `${$('hShadow').value} ${$('vShadow').value} ${$('SBlur').value} ${$('shadowColor').value}`
                })
            }
            canvas.renderAll()
        })
        imgFilterEidt();
    })
}
var lockdraw = null
selectEvent()
function newDraw(drawtarget) {
    if (lockdraw) {
        canvas.remove(lockdraw)
    }
    if (drawtarget) {
        drawtarget.set({ shadow: `${$('hShadow').value} ${$('vShadow').value} ${$('SBlur').value} ${$('shadowColor').value}` })
        canvas.add(drawtarget)
        lockdraw = drawtarget
    }
    if (!lockdraw) {
        canvas.renderAll()
    }
}// 删除旧图画，使图形编辑有轨迹

function add(option) {
    //自由绘画
    if (drawType === 'drawPen') {
        canvas.freeDrawingBrush.color = colorPicker.value;
        canvas.freeDrawingBrush.width = strokeWidth.value
        return
    }
    //绘制直线
    if (drawType === 'drawLine' && option != 'level' && option != 'upright') {
        var line = new fabric.Line([mouseFromX, mouseFromY, mouseToX, mouseToY],
            {
                stroke: colorPicker.value,
                strokeWidth: strokeWidth.value,
                selectable: true,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true
            })
        newDraw(line)
        confirmDraw(line)
        return
    }
    //绘制水平线
    if (drawType === 'drawLine' && option === 'level') {
        var levelLine = new fabric.Line([mouseFromX, mouseFromY, mouseToX, mouseFromY],
            {
                stroke: colorPicker.value,
                strokeWidth: strokeWidth.value,
                selectable: true,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true
            })
        newDraw(levelLine)
        confirmDraw(levelLine)
        return
    }
    //绘制垂直线
    if (drawType === 'drawLine' && option === 'upright') {
        var upright = new fabric.Line([mouseFromX, mouseFromY, mouseFromX, mouseToY],
            {
                stroke: colorPicker.value,
                strokeWidth: strokeWidth.value,
                selectable: true,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true
            })
        newDraw(upright)
        confirmDraw(upright)
        return
    }
    //绘制虚线
    if (drawType === 'drawDotted') {
        var dotted = new fabric.Line([mouseFromX, mouseFromY, mouseToX, mouseToY],
            {
                strokeDashArray: [8],
                stroke: colorPicker.value,
                strokeWidth: strokeWidth.value,
                selectable: true,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true
            })
        newDraw(dotted)
        confirmDraw(dotted)
        return
    }
    //绘制方形
    if (drawType === 'drawRect') {
        var rect = new fabric.Path(`M ${mouseFromX} ${mouseFromY} L ${mouseFromX} ${mouseToY} L ${mouseToX} ${mouseToY} L${mouseToX} ${mouseFromY} z`);
        rect.set({
            fill: fillColorPicker.value,
            stroke: colorPicker.value,
            selectable: true,
            borderColor: 'red',
            strokeWidth: strokeWidth.value,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true
        })
        console.log(rect)
        newDraw(rect)
        confirmDraw(rect)
        return
    }
    //绘制圆形
    if (drawType === 'drawCircle') {
        r = Math.sqrt((mouseToX - mouseFromX) * (mouseToX - mouseFromX) + (mouseToY - mouseFromY) * (mouseToY - mouseFromY))
        var circle = new fabric.Circle({
            radius: r,
            left: mouseFromX - r,
            top: mouseFromY - r,
            fill: fillColorPicker.value,
            stroke: colorPicker.value,
            strokeWidth: strokeWidth.value,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true
            // selectable: selectableBool
        });
        newDraw(circle)
        confirmDraw(circle)
        return
    }
    //绘制等腰三角形
    if (drawType === 'drawTriangle') {
        //利用Path能够实现，从右往左画
        var triangle = new fabric.Path(`M ${mouseFromX} ${mouseToY} L ${(mouseToX - mouseFromX) / 2 + (mouseFromX)} ${mouseFromY} L ${mouseToX} ${mouseToY} z`);
        triangle.set({
            fill: fillColorPicker.value,
            stroke: colorPicker.value,
            strokeWidth: strokeWidth.value,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true
        })
        // console.log(triangle.width, triangle.height)
        newDraw(triangle)
        confirmDraw(triangle)
        return
    }
    //绘制椭圆形
    if (drawType === 'drawEllipse') {
        var ellipse = new fabric.Ellipse({
            rx: Math.abs(mouseToX - mouseFromX),
            ry: Math.abs(mouseToY - mouseFromY),
            left: mouseFromX,
            top: mouseFromY,
            fill: fillColorPicker.value,
            stroke: colorPicker.value,
            strokeWidth: strokeWidth.value,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true
        })
        newDraw(ellipse)
        confirmDraw(ellipse)
        return
    }
    //绘制直角三角形
    if (drawType === 'drawRightTri') {
        var rightTri = new fabric.Path(`M ${mouseFromX} ${mouseFromY} L ${mouseFromX} ${mouseToY} L ${mouseToX} ${mouseToY} z`);
        rightTri.set({
            fill: fillColorPicker.value,
            stroke: colorPicker.value,
            strokeWidth: strokeWidth.value,
            hasControls: false,
            selected: true,
            lockMovementX: true,
            lockMovementY: true
        })
        newDraw(rightTri)  //添加图形
        confirmDraw(rightTri)  //确定编辑
        return
    }
    //插入图片

    if (drawType === 'imgEdit') {
        $(`myimg${imgId}`).onload = function () {
            var imgInstance = new fabric.Image($(`myimg${imgId}`), {
                left: 100,
                top: 100,
                borderColor: 'red',
            })
            imgInstance.applyFilters()
            imgInstance.set({
                width: imgInstance.getOriginalSize().width,
                height: imgInstance.getOriginalSize().height
            })
            // console.log(imgInstance.getOriginalSize())
            canvas.add(imgInstance)
            imgArr.push(imgInstance)
            canvas.renderAll()
            confirmDraw(imgInstance)
            // console.log(imgArr)
            imgArr.forEach(function (item, index) {
                item.on('mousedblclick', function () {
                    this.set({
                        selectable: true,
                        lockMovementX: false,
                        lockMovementY: false,
                        hasControls: true
                    })
                })
            }),
                imgId++
        }
    }
}
//确定按钮
function confirmDraw(drawtarget) {
    //画完直接确定
    confirmBtn.onclick = function () {
        drawtarget.set({
            lockMovementX: true,
            lockMovementY: true,
            // selectable: false,
            hasControls: false
        })
    }
}


function addText() {
    // 绘制文字
    if (drawType === 'drawText') {
        var textBox = new fabric.Textbox('选中文字开始编辑', {
            left: 100,
            top: 100,
            fontFamily: $('fFSelect').value,
            fontSize: $('fSizeR').value,
            stroke: $('fColor').value,
            fill: fFillColor.value,
            fontWeight: $('fWeight').type === 'default' ? '' : 'bold',
            fontStyle: $('fStyle').type === 'default' ? '' : 'italic',
            editable: true,
            borderColor: '#1296db',
            textBackgroundColor: $('textBgColor').value,
            backgroundColor: '',
            underline: $('fUnderLine').type === 'default' ? '' : true,
            linethrough: $('fLineThrough').type === 'default' ? '' : true,
            overline: $('fOverLine').type === 'default' ? '' : true
        })
        textBox.enterEditing();
        textBox.set({
            isEditing: true,
            hasControls: false,
            selectionStart: textBox._text.length,
            selectionEnd: textBox._text.length,
        })
        //点击其他确定编辑
        canvas.on('mouse:down', function (e) {
            if (!textBox.selected) {
                textBox.exitEditing();
            }
        })
        canvas.add(textBox)
        // console.log(textBox)
        canvas.renderAll()
        setTextStyle(textBox)
        return
    }
}

//设置字体样式
function setTextStyle(textTarget) {
    //设置字体
    // console.log(textTarget)
    $('fFSelect').addEventListener('slChange', function () {
        if (textTarget.selected) {
            console.log(textTarget)
            textTarget.set({
                fontFamily: this.value,
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            fontFamily: this.value
        })
        canvas.renderAll();
    })
    //设置绘制颜色
    $('fColor').addEventListener('slChange', function () {
        if (textTarget.selected) {
            textTarget.set({
                stroke: this.value,
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            stroke: this.value
        })
        canvas.renderAll(); //实时刷新
    })
    // 设置填充颜色
    fFillColor.addEventListener('slChange', function () {
        if (textTarget.selected) {
            textTarget.set({
                fill: this.value,
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            fill: this.value
        })
        canvas.renderAll(); //实时刷新
    })
    $('textBgColor').addEventListener('slChange', function () {
        if (textTarget.selected) {
            textTarget.set({
                textBackgroundColor: this.value,
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            textBackgroundColor: this.value
        })
        canvas.renderAll(); //实时刷新
    })
    //设置字号
    $('fSize').addEventListener('slChange', function () {
        if (textTarget.selected) {
            textTarget.set({
                fontSize: this.value
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            fontSize: this.value
        })
        canvas.renderAll();
        $('fSizeR').value = this.value
    })
    $('fSizeR').addEventListener('slChange', function () {
        if (textTarget.selected) {
            textTarget.set({
                fontSize: this.value
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            fontSize: this.value
        })
        canvas.renderAll();
        $('fSize').value = this.value
    })
    //字体加粗
    $('fWeight').onclick = function () {
        if (this.type === 'default') {
            this.type = 'success'
        } else {
            this.type = 'default'
        }
        if (textTarget.selected) {
            textTarget.set({
                fontWeight: this.type === 'default' ? '' : 'bold'
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            fontWeight: this.type === 'default' ? '' : 'bold'
        })
        canvas.renderAll();
    }
    //字体斜体
    $('fStyle').onclick = function () {
        if (this.type === 'default') {
            this.type = 'success'
        } else {
            this.type = 'default'
        }
        if (textTarget.selected) {
            textTarget.set({
                fontStyle: this.type === 'default' ? '' : 'italic'
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            fontStyle: this.type === 'default' ? '' : 'italic'
        })
        canvas.renderAll();
    }
    // 下划线
    $('fUnderLine').onclick = function () {
        if (this.type === 'default') {
            this.type = 'success'
        } else {
            this.type = 'default'
        }
        if (textTarget.selected) {
            textTarget.set({
                underline: this.type === 'default' ? '' : true
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            underline: this.type === 'default' ? '' : true
        })
        canvas.renderAll();
    }
    //中划线
    $('fLineThrough').onclick = function () {
        if (this.type === 'default') {
            this.type = 'success'
        } else {
            this.type = 'default'
        }
        if (textTarget.selected) {
            textTarget.set({
                linethrough: this.type === 'default' ? '' : true
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            linethrough: this.type === 'default' ? '' : true
        })
        canvas.renderAll();
    }
    //上划线
    $('fOverLine').onclick = function () {
        if (this.type === 'default') {
            this.type = 'success'
        } else {
            this.type = 'default'
        }
        if (textTarget.selected) {
            textTarget.set({
                overline: this.type === 'default' ? '' : true
            })
            canvas.renderAll();
        }
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            overline: this.type === 'default' ? '' : true
        })
        canvas.renderAll();
    }
    //上标
    $('fSup').onclick = function () {
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSuperscript();
        canvas.requestRenderAll();
    }
    //下标
    $('fSub').onclick = function () {
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSubscript();
        canvas.requestRenderAll()
    }
    //取消上下标
    $('removeS').onclick = function () {
        var active = canvas.getActiveObject();
        if (!active) return;
        active.setSelectionStyles({
            fontSize: undefined,
            deltaY: undefined,
        });
        canvas.requestRenderAll();
    }

}


function initTextClickStyle() {
    //字体加粗
    $('fWeight').onclick = function () {
        if (this.type === 'default') {
            this.type = 'success'
        } else {
            this.type = 'default'
        }
    }
    //字体斜体
    $('fStyle').onclick = function () {
        if (this.type === 'default') {
            this.type = 'success'
        } else {
            this.type = 'default'
        }
    }
    // 下划线
    $('fUnderLine').onclick = function () {
        if (this.type === 'default') {
            this.type = 'success'
        } else {
            this.type = 'default'
        }
    }
    //中划线
    $('fLineThrough').onclick = function () {
        if (this.type === 'default') {
            this.type = 'success'
        } else {
            this.type = 'default'
        }
    }
    //上划线
    $('fOverLine').onclick = function () {
        if (this.type === 'default') {
            this.type = 'success'
        } else {
            this.type = 'default'
        }
    }
}
initTextClickStyle()

// 图片滤镜编辑
var webglBackend;
var f = fabric.Image.filters;
console.log(f)
console.log(new fabric.Image.filters.Grayscale())
try {
    webglBackend = new fabric.WebglFilterBackend();
} catch (e) {
    console.log(e)
}

fabric.filterBackend = fabric.initFilterBackend();
fabric.Object.prototype.transparentCorners = false;
fabric.filterBackend = webglBackend;
// fabric.Object.prototype.transparentCorners = false;
var filters = ['grayscale', 'invert', 'remove-color', 'sepia', 'brownie',
    'brightness', 'contrast', 'saturation', 'noise', 'vintage',
    'pixelate', 'blur', 'sharpen', 'emboss', 'technicolor',
    'polaroid', 'blend-color', 'gamma', 'kodachrome',
    'blackwhite', 'blend-image', 'hue', 'resize'];
function getFilter(index) {
    var obj = canvas.getActiveObject();
    return obj.filters[index];
}
//第一种滤镜
function applyFilter(index, filter) {
    var obj = canvas.getActiveObject();  //选中的目标
    obj.filters[index] = filter;
    console.log(obj)
    obj.applyFilters();
    canvas.renderAll();
}
//第二种滤镜
function applyFilterValue(index, prop, value) {
    var obj = canvas.getActiveObject();
    if (obj.filters[index]) {
        obj.filters[index][prop] = value;
        obj.applyFilters();
        canvas.renderAll();
    }
}
//没有勾选不可以改值
if (!$('gamma').checked) {
    $('gamma-red').disabled = true
    $('gamma-green').disabled = true
    $('gamma-blue').disabled = true
}
function imgFilterEidt() {
    if (canvas._activeObject.cacheKey) {
        for (var i = 0; i < filters.length; i++) {
            //&& 中，第一个为true 则执行后面的语句
            $(filters[i]) && (
                $(filters[i]).checked = !!canvas.getActiveObject().filters[i]); //将类型转换成布尔值
        }
    }
    $('brownie').onclick = function () {
        applyFilter(4, this.checked && new f.Brownie());
    };
    $('vintage').onclick = function () {
        applyFilter(9, this.checked && new f.Vintage());
    };
    $('technicolor').onclick = function () {
        applyFilter(14, this.checked && new f.Technicolor());
    };
    $('polaroid').onclick = function () {
        applyFilter(15, this.checked && new f.Polaroid());
    };
    $('kodachrome').onclick = function () {
        applyFilter(18, this.checked && new f.Kodachrome());
    };
    $('blackwhite').onclick = function () {
        applyFilter(19, this.checked && new f.BlackWhite());
    };
    $('grayscale').addEventListener('slChange', function () {
        console.log(f)
        console.log(new f.Grayscale())
        applyFilter(0, this.checked && new f.Grayscale());
    });
    $('average').onclick = function () {
        applyFilterValue(0, 'mode', 'average');
    };
    $('luminosity').onclick = function () {
        applyFilterValue(0, 'mode', 'luminosity');
    };
    $('lightness').onclick = function () {
        applyFilterValue(0, 'mode', 'lightness');
    };
    $('invert').onclick = function () {
        applyFilter(1, this.checked && new f.Invert());
    };
    $('remove-color').onclick = function () {
        applyFilter(2, this.checked && new f.RemoveColor({
            distance: $('remove-color-distance').value,
            color: $('remove-color-color').value,
        }));
    };
    $('remove-color-color').addEventListener('slChange', function () {
        applyFilterValue(2, 'color', this.value);
    })
    $('remove-color-distance').addEventListener('slChange', function () {
        applyFilterValue(2, 'distance', this.value);
    })
    $('sepia').onclick = function () {
        applyFilter(3, this.checked && new f.Sepia());
    };
    $('brightness').onclick = function () {
        applyFilter(5, this.checked && new f.Brightness({
            brightness: parseFloat($('brightness-value').value)
        }));
    };
    $('brightness-value').addEventListener('slChange', function () {
        console.log(1234)
        applyFilterValue(5, 'brightness', parseFloat(this.value));
    })
    $('gamma').onclick = function () {
        if (this.checked) {
            //没有勾选不可以改值
            $('gamma-red').disabled = false
            $('gamma-green').disabled = false
            $('gamma-blue').disabled = false
        } else {
            $('gamma-red').disabled = true
            $('gamma-green').disabled = true
            $('gamma-blue').disabled = true
        }
        var v1 = parseFloat($('gamma-red').value); //初始值
        var v2 = parseFloat($('gamma-green').value);
        var v3 = parseFloat($('gamma-blue').value);
        applyFilter(17, this.checked && new f.Gamma({
            gamma: [v1, v2, v3]
        }));
    };
    // 修改红色值
    $('gamma-red').addEventListener('slChange', function () {

        var current = getFilter(17).gamma;
        current[0] = parseFloat(this.value); //字符串解析为小数点
        applyFilterValue(17, 'gamma', current);
    })
    //修改绿色值
    $('gamma-green').addEventListener('slChange', function () {
        var current = getFilter(17).gamma;
        current[1] = parseFloat(this.value);
        applyFilterValue(17, 'gamma', current);
    })
    //修改蓝色值
    $('gamma-blue').addEventListener('slChange', function () {
        var current = getFilter(17).gamma;
        current[2] = parseFloat(this.value);
        applyFilterValue(17, 'gamma', current);
    })
    $('contrast').onclick = function () {
        applyFilter(6, this.checked && new f.Contrast({
            contrast: parseFloat($('contrast-value').value)
        }));
    };
    $('contrast-value').addEventListener('slChange', function () {
        applyFilterValue(6, 'contrast', parseFloat(this.value));
    })
    $('saturation').onclick = function () {
        applyFilter(7, this.checked && new f.Saturation({
            saturation: parseFloat($('saturation-value').value)
        }));
    };
    $('saturation-value').addEventListener('slChange', function () {
        applyFilterValue(7, 'saturation', parseFloat(this.value))
    })

    $('noise').onclick = function () {
        applyFilter(8, this.checked && new f.Noise({
            noise: parseInt($('noise-value').value, 10)
        }));
    };
    $('noise-value').addEventListener('slChange', function () {
        applyFilterValue(8, 'noise', parseInt(this.value, 10));
    })
    $('pixelate').onclick = function () {
        applyFilter(10, this.checked && new f.Pixelate({
            blocksize: parseInt($('pixelate-value').value, 10)
        }));
    };
    $('pixelate-value').addEventListener('slChange', function () {
        applyFilterValue(10, 'blocksize', parseInt(this.value, 10))
    })

    $('blur').onclick = function () {
        applyFilter(11, this.checked && new f.Blur({
            value: parseFloat($('blur-value').value)
        }));
    };
    $('blur-value').addEventListener('slChange', function () {
        applyFilterValue(11, 'blur', parseFloat(this.value, 10));
    })
    $('sharpen').onclick = function () {
        applyFilter(12, this.checked && new f.Convolute({
            matrix: [0, -1, 0,
                -1, 5, -1,
                0, -1, 0]
        }));
    };
    $('emboss').onclick = function () {
        applyFilter(13, this.checked && new f.Convolute({
            matrix: [1, 1, 1,
                1, 0.7, -1,
                -1, -1, -1]
        }));
    };
    $('blend').onclick = function () {
        applyFilter(16, this.checked && new f.BlendColor({
            color: document.getElementById('blend-color').value,
            mode: document.getElementById('blend-mode').value,
            alpha: document.getElementById('blend-alpha').value
        }));
    };
    $('blend-mode').addEventListener('slChange', function () {
        applyFilterValue(16, 'mode', this.value);
    })
    $('blend-color').addEventListener('slChange', function () {
        applyFilterValue(16, 'color', this.value);
    })
    $('blend-alpha').addEventListener('slChange', function () {
        applyFilterValue(16, 'alpha', this.value);
    })

    $('hue').onclick = function () {
        applyFilter(21, this.checked && new f.HueRotation({
            rotation: $('hue-value').value,
        }));
    };

    $('hue-value').addEventListener('slChange', function () {
        applyFilterValue(21, 'rotation', this.value);
    })
    var fImage = new fabric.Image($('preImg'));
    $('blend-image').onclick = function () {
        applyFilter(20, this.checked && new f.BlendImage({
            image: fImage,
        }));
    };
    $('blend-image-mode').addEventListener('slChange', function () {
        applyFilterValue(20, 'mode', this.value);
    })
}
