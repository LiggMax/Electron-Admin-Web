<template>
  <div class="cyber-download-page">
    <!-- 背景动画 -->
    <div class="cyber-bg">
      <div class="grid-lines"></div>
      <div class="floating-particles"></div>
    </div>

    <!-- 主要内容 -->
    <div class="content-container">
      <!-- 标题区域 -->
      <div class="header-section">
        <h1 class="cyber-title">
          <span class="glitch" data-text="CYBER SOFTWARE">CYBER SOFTWARE</span>
        </h1>
      </div>

      <!-- 软件介绍卡片 -->
      <div class="software-card">
        <div class="card-header">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">ONLINE</span>
          </div>
          <div class="version-badge">v1.2.4</div>
        </div>
        
        <div class="software-info">
          <div class="software-icon">
            <div class="icon-placeholder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div class="software-details">
            <h2 class="software-name">长虹国际接码平台</h2>
            <p class="software-description">
              一款革命性的跨平台桌面应用程序，
              提供强大的功能集合。
            </p>
            
            <div class="features-grid">
              <div class="feature-item">
                <span class="feature-icon">⚡</span>
                <span>高性能处理</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔒</span>
                <span>安全加密</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎨</span>
                <span>现代界面</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🚀</span>
                <span>快速启动</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 下载按钮区域 -->
      <div class="download-section">
        <h3 class="section-title">立即下载</h3>
        <div class="download-buttons">
          <button class="download-btn primary" @click="downloadWindows">
            <div class="btn-content">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none">
                <path d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17M7 11L12 16M12 16L17 11M12 16V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="btn-text">
                <span class="btn-title">客户端</span>
                <span class="btn-subtitle">适用于 Windows 10/11</span>
              </div>
            </div>
            <div class="btn-glow"></div>
          </button>
          
          <button class="download-btn secondary" @click="downloadMac">
            <div class="btn-content">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none">
                <path d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17M7 11L12 16M12 16L17 11M12 16V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="btn-text">
                <span class="btn-title">卡商端</span>
                <span class="btn-subtitle">适用于 Windows 10/11</span>
              </div>
            </div>
            <div class="btn-glow"></div>
          </button>
        </div>
        
        <div class="download-info">
          <p>文件大小: ~45MB | 最后更新: 2024年1月</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Download',
  methods: {
    downloadWindows() {
      // 这里填写Windows版本的下载链接
      console.log('下载Windows版本');
      window.open('http://129.204.224.233:19000/electron-app/changhong-1.2.4.exe', '_blank');
    },
    downloadMac() {
      // 这里填写macOS版本的下载链接
      console.log('下载macOS版本');
      window.open('http://129.204.224.233:19000/electron-app/changhong-ks-1.2.4.exe', '_blank');
    }
  }
}
</script>

<style scoped>
.cyber-download-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* 背景动画 */
.cyber-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-particles::before,
.floating-particles::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ffff;
  animation: float 6s ease-in-out infinite;
}

.floating-particles::before {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-particles::after {
  top: 60%;
  right: 15%;
  animation-delay: 3s;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 主要内容 */
.content-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 标题区域 */
.header-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.cyber-title {
  font-size: 4rem;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.glitch {
  position: relative;
  color: #00ffff;
  text-shadow: 
    0 0 5px #00ffff,
    0 0 10px #00ffff,
    0 0 15px #00ffff;
  animation: glitch 2s infinite;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  animation: glitch-1 0.5s infinite;
  color: #ff0080;
  z-index: -1;
}

.glitch::after {
  animation: glitch-2 0.5s infinite;
  color: #00ff80;
  z-index: -2;
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}

@keyframes glitch-1 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-1px, 1px); }
  40% { transform: translate(-1px, -1px); }
  60% { transform: translate(1px, 1px); }
  80% { transform: translate(1px, -1px); }
}

@keyframes glitch-2 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(1px, -1px); }
  40% { transform: translate(1px, 1px); }
  60% { transform: translate(-1px, -1px); }
  80% { transform: translate(-1px, 1px); }
}

.subtitle {
  font-size: 1.5rem;
  color: #888;
  margin-top: 1rem;
  font-weight: 300;
}

/* 软件卡片 */
.software-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.software-card:hover {
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 0 12px 40px rgba(0, 255, 255, 0.2);
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #00ff00;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  color: #00ff00;
  font-size: 0.9rem;
  font-weight: 600;
}

.version-badge {
  background: linear-gradient(45deg, #ff0080, #00ffff);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.software-info {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.software-icon {
  flex-shrink: 0;
}

.icon-placeholder {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #00ffff, #ff0080);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.icon-placeholder svg {
  width: 40px;
  height: 40px;
}

.software-details {
  flex: 1;
}

.software-name {
  font-size: 2rem;
  margin: 0 0 1rem 0;
  color: #00ffff;
}

.software-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #ccc;
  margin-bottom: 1.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.feature-icon {
  font-size: 1.2rem;
}

/* 系统要求 */
.system-requirements {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  color: #00ffff;
  margin-bottom: 1rem;
  font-weight: 600;
}

.requirements-grid {
  display: grid;
  gap: 0.8rem;
}

.req-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.req-label {
  color: #aaa;
  font-weight: 500;
}

.req-value {
  color: #fff;
  text-align: right;
}

/* 下载按钮区域 */
.download-section {
  text-align: center;
}

.download-buttons {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.download-btn {
  position: relative;
  background: transparent;
  border: 2px solid;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 250px;
}

.download-btn.primary {
  border-color: #00ffff;
  color: #00ffff;
}

.download-btn.secondary {
  border-color: #ff0080;
  color: #ff0080;
}

.download-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.download-btn.primary:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
}

.download-btn.secondary:hover {
  background: rgba(255, 0, 128, 0.1);
  box-shadow: 0 10px 30px rgba(255, 0, 128, 0.3);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.btn-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.btn-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.btn-subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.download-btn:hover .btn-glow {
  transform: translateX(100%);
}

.download-info {
  color: #888;
  font-size: 0.9rem;
  margin-top: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-container {
    padding: 1rem;
  }
  
  .cyber-title {
    font-size: 2.5rem;
  }
  
  .software-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .download-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .download-btn {
    min-width: 100%;
    max-width: 300px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>