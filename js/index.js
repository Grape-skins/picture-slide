
const container = document.getElementById("carouselContainer");
const track = document.getElementById("carouselTrack");
const dots = document.querySelectorAll(".dot");

let startX = 0;
let currentX = 0;
let threshold = 5;
let isDragging = false;
let currentTranslateX = 0; // 当前transform位置
let isAnimating = false;
let animationFrameId = null;
let itemWidth = 0; // 每个项目的宽度
let containerWidth = 0; // 容器宽度
let isSliding = false; // 是否正在滑动

// 跟踪当前显示的图片索引
let currentImageIndex = 0;

// 计算当前应该显示哪个圆点
function getCurrentIndex() {
    return currentImageIndex;
}

function updateDots() {
    const currentIndex = getCurrentIndex();
    dots.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

function updateActiveItem() {
    // 移除active状态更新，保持所有图片一致
}

// 丝滑滑动到指定位置
function slideToPosition(targetPosition, animate = true) {
    if (isAnimating && animate) return;

    if (animate) {
        isAnimating = true;
        track.classList.add("sliding");
    }

    // 使用CSS transform实现丝滑滑动
    track.style.transform = `translateX(${targetPosition}px)`;
    currentTranslateX = targetPosition;

    if (animate) {
        setTimeout(() => {
            track.classList.remove("sliding");
            isAnimating = false;
        }, 300);
    }

    updateDots();
    updateActiveItem();
}

// 显示下一张图片（向右滑动）
function slideNext() {
    const newPosition = currentTranslateX - itemWidth;
    slideToPosition(newPosition);

    // 滑动完成后重新排列DOM，实现循环插队
    setTimeout(() => {
        // 暂停过渡动画
        track.style.transition = "none";

        const first = track.firstElementChild;
        track.appendChild(first);
        currentTranslateX += itemWidth;
        track.style.transform = `translateX(${currentTranslateX}px)`;
        currentImageIndex = (currentImageIndex + 1) % dots.length;
        updateDots();

        // 恢复过渡动画
        requestAnimationFrame(() => {
            track.style.transition = "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        });
    }, 300);
}

// 显示上一张图片（向左滑动）
function slidePrev() {
    const newPosition = currentTranslateX + itemWidth;
    slideToPosition(newPosition);

    // 滑动完成后重新排列DOM，实现循环插队
    setTimeout(() => {
        // 暂停过渡动画
        track.style.transition = "none";

        const last = track.lastElementChild;
        track.insertBefore(last, track.firstElementChild);
        currentTranslateX -= itemWidth;
        track.style.transform = `translateX(${currentTranslateX}px)`;
        currentImageIndex = (currentImageIndex - 1 + dots.length) % dots.length;
        updateDots();

        // 恢复过渡动画
        requestAnimationFrame(() => {
            track.style.transition = "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        });
    }, 300);
}

// 保持原有的reorder函数用于兼容
function reorder(direction) {
    if (direction === "left") {
        slidePrev();
    } else if (direction === "right") {
        slideNext();
    }
}

// 点击圆点切换图片
dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        if (isAnimating) return;

        const targetIndex = parseInt(dot.dataset.index);
        const currentIndex = getCurrentIndex();
        const diff = targetIndex - currentIndex;

        // 使用DOM重排实现跳转
        if (diff > 0) {
            // 向右移动：将前面的元素移到后面
            for (let i = 0; i < diff; i++) {
                const first = track.firstElementChild;
                track.appendChild(first);
            }
        } else if (diff < 0) {
            // 向左移动：将后面的元素移到前面
            for (let i = 0; i < Math.abs(diff); i++) {
                const last = track.lastElementChild;
                track.insertBefore(last, track.firstElementChild);
            }
        }

        // 重置位置到0并更新索引
        track.style.transition = "none";
        currentTranslateX = 0;
        track.style.transform = `translateX(0px)`;
        currentImageIndex = targetIndex;
        updateDots();

        // 恢复过渡动画
        requestAnimationFrame(() => {
            track.style.transition = "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        });
    });
});



// 丝滑的鼠标拖拽事件
container.addEventListener("mousedown", (e) => {
    if (isAnimating) return;
    isDragging = true;
    startX = e.pageX;
    currentX = e.pageX;
    container.style.cursor = "grabbing";
    container.classList.add("touching");

    // 暂停动画过渡
    track.style.transition = "none";
});

container.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    currentX = e.pageX;

    // 实时跟随鼠标移动
    const delta = currentX - startX;
    const newPosition = currentTranslateX + delta;
    track.style.transform = `translateX(${newPosition}px)`;
});

container.addEventListener("mouseup", (e) => {
    if (!isDragging) return;

    const delta = currentX - startX;
    const velocity = Math.abs(delta) / 100; // 简单的速度计算

    // 恢复动画过渡
    track.style.transition = "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    // 根据拖拽距离和速度决定是否切换
    if (Math.abs(delta) > threshold || velocity > 0.5) {
        if (delta > 0) {
            slidePrev(); // 从左往右拖拽显示上一张
        } else {
            slideNext(); // 从右往左拖拽显示下一张
        }
    } else {
        // 回弹到原位置
        slideToPosition(currentTranslateX);
    }

    isDragging = false;
    container.style.cursor = "grab";
    container.classList.remove("touching");
});

container.addEventListener("mouseleave", () => {
    if (isDragging) {
        isDragging = false;
        container.style.cursor = "grab";
        container.classList.remove("touching");
    }
});

// 丝滑的触摸事件
let touchStartX = 0;
let touchStartTime = 0;
let touchVelocity = 0;

container.addEventListener("touchstart", (e) => {
    if (isAnimating) return;
    touchStartX = e.touches[0].clientX;
    touchStartTime = Date.now();
    container.classList.add("touching");

    // 暂停动画过渡
    track.style.transition = "none";
}, { passive: true });

container.addEventListener("touchmove", (e) => {
    if (isAnimating) return;
    e.preventDefault();

    const touchX = e.touches[0].clientX;
    const delta = touchX - touchStartX;
    const newPosition = currentTranslateX + delta;
    track.style.transform = `translateX(${newPosition}px)`;
}, { passive: false });

container.addEventListener("touchend", (e) => {
    if (isAnimating) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndTime = Date.now();
    const delta = touchEndX - touchStartX;
    const duration = touchEndTime - touchStartTime;

    // 计算滑动速度
    touchVelocity = Math.abs(delta) / duration;

    // 恢复动画过渡
    track.style.transition = "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    // 根据速度和距离判断滑动
    if (Math.abs(delta) > threshold || (Math.abs(delta) > 20 && touchVelocity > 0.5)) {
        if (delta > 0) {
            slidePrev(); // 从左往右滑动显示上一张
        } else {
            slideNext(); // 从右往左滑动显示下一张
        }
    } else {
        // 回弹到原位置
        slideToPosition(currentTranslateX);
    }

    container.classList.remove("touching");
}, { passive: true });

// 键盘事件
document.addEventListener("keydown", (e) => {
    if (isAnimating) return;

    if (e.key === "ArrowLeft") {
        slidePrev(); // 左箭头显示上一张
    } else if (e.key === "ArrowRight") {
        slideNext(); // 右箭头显示下一张
    }
});

// 初始化函数
function initializeCarousel() {
    // 计算每个项目的宽度
    const firstItem = track.querySelector('.carousel-item');
    if (firstItem) {
        itemWidth = firstItem.offsetWidth + 20; // 包含gap
        containerWidth = container.offsetWidth;
    }

    // 初始化位置 - 从第一组图片开始
    currentTranslateX = 0;
    track.style.transform = `translateX(0px)`;
}

// 初始化active状态
updateActiveItem();

// 初始化轮播图
initializeCarousel();

// 添加性能优化
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 优化窗口大小变化
window.addEventListener('resize', debounce(() => {
    // 重新计算布局
    initializeCarousel();
}, 250));