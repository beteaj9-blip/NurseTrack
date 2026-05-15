const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const loginParams = new URLSearchParams(window.location.search);

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

function cleanLoginFlag() {
  const cleanUrl = window.location.href.replace(window.location.search, "");
  window.history.replaceState({}, document.title, cleanUrl);
}

function runLoginLogoAnimation() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sidebarLogo = document.querySelector(".sidebar-logo");
  const topbarLogo = document.querySelector(".topbar-logo");
  const targetLogo = sidebarLogo || topbarLogo;

  if (prefersReducedMotion || !targetLogo) {
    cleanLoginFlag();
    return;
  }

  const stage = document.createElement("div");
  stage.className = "login-logo-stage";

  const logo = document.createElement("img");
  logo.className = "login-logo-mark";
  logo.src = "../assets/cit-u-logo.png";
  logo.alt = "";

  stage.append(logo);
  document.body.append(stage);

  window.requestAnimationFrame(() => {
    let targetRect = targetLogo.getBoundingClientRect();

    if ((targetRect.left < 0 || targetRect.width === 0) && topbarLogo) {
      targetRect = topbarLogo.getBoundingClientRect();
    }

    const startSize = Math.min(128, Math.max(92, window.innerWidth * 0.16));
    const startX = (window.innerWidth - startSize) / 2;
    const startY = (window.innerHeight - startSize) / 2;

    logo.style.left = `${startX}px`;
    logo.style.top = `${startY}px`;
    logo.style.width = `${startSize}px`;
    logo.style.height = `${startSize}px`;

    logo.animate(
      [
        {
          opacity: 0,
          left: `${startX}px`,
          top: `${startY}px`,
          width: `${startSize}px`,
          height: `${startSize}px`,
          transform: "scale(0.86)"
        },
        {
          opacity: 1,
          left: `${startX}px`,
          top: `${startY}px`,
          width: `${startSize}px`,
          height: `${startSize}px`,
          transform: "scale(1.06) rotate(-3deg)",
          offset: 0.18
        },
        {
          opacity: 1,
          left: `${startX}px`,
          top: `${startY}px`,
          width: `${startSize}px`,
          height: `${startSize}px`,
          transform: "scale(0.98) rotate(2deg)",
          offset: 0.28
        },
        {
          opacity: 1,
          left: `${startX}px`,
          top: `${startY}px`,
          width: `${startSize}px`,
          height: `${startSize}px`,
          transform: "scale(1) rotate(0deg)",
          offset: 0.42
        },
        {
          opacity: 1,
          left: `${startX}px`,
          top: `${startY}px`,
          width: `${startSize}px`,
          height: `${startSize}px`,
          transform: "scale(1) rotate(0deg)",
          offset: 0.64
        },
        {
          opacity: 1,
          left: `${targetRect.left}px`,
          top: `${targetRect.top}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          transform: "scale(1)"
        }
      ],
      {
        duration: 2200,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
      }
    );

    stage.animate(
      [
        { opacity: 1 },
        { opacity: 1, offset: 0.78 },
        { opacity: 0 }
      ],
      {
        duration: 2450,
        easing: "ease",
        fill: "forwards"
      }
    ).finished.then(() => {
      stage.remove();
      cleanLoginFlag();
    });
  });
}

if (loginParams.get("login") === "student") {
  runLoginLogoAnimation();
}
