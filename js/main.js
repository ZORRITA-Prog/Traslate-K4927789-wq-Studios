// Arranque
(async()=>{const r=await api("me");CU=r.user||null;if(!CU)localStorage.removeItem("tok");await setUI(ui)})();
