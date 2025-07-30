
// 初始化Glide
const glide = new Glide('.glide', {
    // 循环模式
    type: 'carousel',

    // 自动播放 (已禁用)
    autoplay: false,

    // 每页显示数量
    perView: 3,

    // 焦点slide
    focusAt: 'center',

    // 间距
    gap: 20,

    // 动画持续时间
    animationDuration: 600,

    // 缓动函数
    animationTimingFunc: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

    // 触摸设置
    touchRatio: 1,
    touchAngle: 45,

    // 响应式断点
    breakpoints: {
        320: {
            perView: 1.2,
            gap: 10,
        },
        768: {
            perView: 2.5,
            gap: 20,
        },
        1024: {
            perView: 3.5,
            gap: 20,
        },
    },

    // 事件回调
    events: {
        mount: function () {
            console.log('Glide初始化完成');
        },
        move: function () {
            console.log('当前slide索引:', this.index);
        },
        touchstart: function () {
            document.querySelector('.glide').classList.add('touching');
        },
        touchend: function () {
            document.querySelector('.glide').classList.remove('touching');
        },
    },
});

// 挂载Glide
glide.mount();

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        glide.go('<');
    } else if (e.key === 'ArrowRight') {
        glide.go('>');
    }
});

// 鼠标滚轮控制
document.querySelector('.glide').addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
        glide.go('>');
    } else {
        glide.go('<');
    }
}, { passive: false });

// 窗口大小变化时重新初始化
window.addEventListener('resize', () => {
    glide.update();
});

// 添加触摸反馈
const glideContainer = document.querySelector('.glide');

glideContainer.addEventListener('touchstart', () => {
    glideContainer.classList.add('touching');
});

glideContainer.addEventListener('touchend', () => {
    setTimeout(() => {
        glideContainer.classList.remove('touching');
    }, 100);
});